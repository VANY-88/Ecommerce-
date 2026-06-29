import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import api from "../services/api";
import Button from "../components/Button";
import { ApiResponse, Product } from "../types/api";

const lineClamp2: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
};

function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<ApiResponse<Product[]>>("/products");
        setProducts(response.data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (productId: number) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      const response = await api.post("/carts/add-item", {
        userId,
        productId,
      });

      toast.success("Product added to cart successfully!");
      console.log("Product added to cart:", response.data);
    } catch (error) {
      toast.error("Error adding product to cart.");
      console.error("Error adding product to cart:", error);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-brown-400" style={{ paddingBottom: 120 }}>
      <main className="flex-grow-1">
        <Container className="py-4">
          <div className="d-flex flex-column align-items-start gap-5">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-4 w-100">
              <h1 className="fs-1 fs-md-display-2 fw-bold text-black flex-shrink-0">
                What are you{" "}
                <span className="d-block">
                  <span className="text-orange-500">looking</span> for?
                </span>
              </h1>
              <Row className="g-3 w-100 w-lg-auto" xs={2} sm={4}>
                {[
                  { src: "./assets/Furniture.svg", label: "Furniture" },
                  { src: "./assets/decor.svg", label: "Decoration" },
                  { src: "./assets/Storage.svg", label: "Storage" },
                  { src: "./assets/Lighting.svg", label: "Lighting" },
                ].map((cat) => (
                  <Col key={cat.label}>
                    <div className="cursor-pointer d-flex flex-column align-items-start gap-2 gap-sm-4">
                      <img
                        src={cat.src}
                        style={{
                          width: "100%",
                          maxWidth: 160,
                          height: "auto",
                          aspectRatio: "1 / 1",
                          transition: "transform 0.3s",
                        }}
                        alt={cat.label}
                        loading="lazy"
                        decoding="async"
                      />
                      <h1 className="text-black font-dm-sans fw-medium" style={{ lineHeight: "1.25rem" }}>
                        {cat.label}
                      </h1>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            <div className="w-100 border-top border-brown-700"></div>

            <Row className="g-4 w-100" xs={1} md={2} lg={4}>
              {products.map((product) => (
                <Col key={product.id}>
                  <Card
                    className="rounded-4 shadow-sm border border-2 border-white cursor-pointer h-100 product-card-hover"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <Card.Img
                      variant="top"
                      src={product.image}
                      alt={product.name}
                      className="rounded-top-4 product-card-hover-img"
                      style={{ width: "100%", height: 240, objectFit: "cover" }}
                      loading="lazy"
                      decoding="async"
                    />
                    <Card.Body className="bg-white rounded-bottom-4 d-flex flex-column gap-3">
                      <div className="d-flex flex-column gap-1">
                        <p className="text-brown-900 text-uppercase fw-semibold small mb-0">
                          {product.categoryName}
                        </p>
                        <h2 className="fs-3 fw-semibold text-heading-black mb-0">
                          {product.name}
                        </h2>
                        <p className="text-neutral-text-gray fs-5 mb-0" style={lineClamp2}>
                          {product.description}
                        </p>
                      </div>
                      <p className="text-heading-black fw-semibold fs-3 mb-0">
                        ${product.price}
                      </p>

                      <Button
                        text="Add To Cart"
                        onClick={(e?: React.MouseEvent) => {
                          e?.stopPropagation();
                          handleAddToCart(product.id);
                        }}
                        className="mt-2 px-3 py-2 rounded-2"
                      />
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </main>
    </div>
  );
}

export default ProductPage;
