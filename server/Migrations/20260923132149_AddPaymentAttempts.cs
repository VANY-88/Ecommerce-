using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WebShop.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentAttempts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // IX_Orders_CartId becomes unique. Duplicates could only come from the old
            // double-submit race; fail loudly with a clear message instead of a bare index error.
            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM "Orders" GROUP BY "CartId" HAVING COUNT(*) > 1) THEN
                        RAISE EXCEPTION 'AddPaymentAttempts: several orders share a CartId. Resolve them (SELECT "CartId" FROM "Orders" GROUP BY "CartId" HAVING COUNT(*) > 1) before migrating.';
                    END IF;
                END $$;
                """);

            migrationBuilder.DropIndex(
                name: "IX_Orders_CartId",
                table: "Orders");

            migrationBuilder.AddColumn<int>(
                name: "CurrentAttemptId",
                table: "Orders",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                table: "Orders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrderId = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    Image = table.Column<string>(type: "text", nullable: true),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    LineTotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PaymentAttempts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrderId = table.Column<int>(type: "integer", nullable: false),
                    Method = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TxnRef = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AmountVnd = table.Column<long>(type: "bigint", nullable: false),
                    GatewayCreateDate = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    PaymentUrl = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ResponseCode = table.Column<string>(type: "text", nullable: true),
                    GatewayTransactionId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastQueriedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentAttempts_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CartId",
                table: "Orders",
                column: "CartId",
                unique: true);

            // Snapshot the items of existing orders from their (completed) carts.
            migrationBuilder.Sql("""
                INSERT INTO "OrderItems" ("OrderId", "ProductId", "ProductName", "Image", "UnitPrice", "UnitCost", "Quantity", "LineTotal")
                SELECT o."Id", ci."ProductId", p."Name", p."Image",
                       CASE WHEN ci."Quantity" > 0 THEN ROUND(ci."Price" / ci."Quantity", 2) ELSE 0 END,
                       p."CostPrice", ci."Quantity", ci."Price"
                FROM "Orders" o
                JOIN "CartItems" ci ON ci."CartId" = o."CartId"
                JOIN "Products" p ON p."Id" = ci."ProductId";

                UPDATE "Orders" SET "PaidAt" = "OrderDate" WHERE "PaymentStatus" = 'Paid';
                """);

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAttempts_OrderId_Pending",
                table: "PaymentAttempts",
                column: "OrderId",
                unique: true,
                filter: "\"Status\" = 'Pending'");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAttempts_TxnRef",
                table: "PaymentAttempts",
                column: "TxnRef",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "PaymentAttempts");

            migrationBuilder.DropIndex(
                name: "IX_Orders_CartId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CurrentAttemptId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                table: "Orders");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CartId",
                table: "Orders",
                column: "CartId");
        }
    }
}
