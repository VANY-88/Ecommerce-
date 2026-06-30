import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import api from "../services/api";
import Button from "../components/Button";
import { ApiResponse, Category, Product } from "../types/api";

const lineClamp2: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
};

const CATEGORY_ICONS: Record<string, string> = {
  Furniture: "./assets/Furniture.svg",
  Decoration: "./assets/decor.svg",
  Storage: "./assets/Storage.svg",
  Lighting: "./assets/lighting.svg",
};

function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get<ApiResponse<Product[]>>("/products"),
          api.get<ApiResponse<Category[]>>("/categories"),
        ]);
        setProducts(productsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        console.error("Error fetching products/categories:", error);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const filteredProducts = React.useMemo(
    () =>
      selectedCategoryId === null
        ? products
        : products.filter((p) => p.categoryId === selectedCategoryId),
    [products, selectedCategoryId]
  );

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
              <Row className="g-4 w-100 w-lg-auto" xs={2} sm={4}>
                {categories.map((cat) => {
                  const isActive = selectedCategoryId === cat.id;
                  const iconSrc = CATEGORY_ICONS[cat.name];
                  return (
                    <Col key={cat.id}>
                      <div
                        className="cursor-pointer d-flex flex-column align-items-center text-center gap-2"
                        onClick={() => handleCategoryClick(cat.id)}
                        role="button"
                        aria-pressed={isActive}
                      >
                        <div
                          className={`category-avatar-ring${isActive ? " is-active" : ""}`}
                          style={{ width: "100%", maxWidth: 104, aspectRatio: "1 / 1" }}
                        >
                          {iconSrc ? (
                            <img
                              src={iconSrc}
                              className="category-avatar-img"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              alt={cat.name}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div
                              className="category-avatar-fallback fw-bold d-flex align-items-center justify-content-center w-100 h-100"
                              style={{ fontSize: "2rem" }}
                              aria-label={cat.name}
                            >
                              {cat.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span
                          className={`category-avatar-label font-dm-sans fw-semibold text-uppercase small ${
                            isActive ? "text-orange-500" : "text-brown-1000"
                          }`}
                        >
                          {cat.name}
                        </span>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>

            <div className="w-100 border-top border-brown-700"></div>

            <Row className="g-4 w-100" xs={1} md={2} lg={4}>
              {filteredProducts.map((product) => (
                <Col key={product.id}>
                  <Card
                    className="rounded-4 shadow-sm border border-2 border-white cursor-pointer h-100 product-card-hover"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div
                      className="rounded-top-4 overflow-hidden bg-brown-300 d-flex align-items-center justify-content-center"
                      style={{ height: 240 }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-100 h-100 product-card-hover-img"
                        style={{ objectFit: "cover" }}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <Card.Body className="bg-white rounded-bottom-4 d-flex flex-column gap-3">
                      <div className="d-flex flex-column gap-1 flex-grow-1">
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
            {filteredProducts.length === 0 && (
              <p className="text-neutral-text-gray text-center w-100 py-5">
                No products found in this category.
              </p>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}

export default ProductPage;
