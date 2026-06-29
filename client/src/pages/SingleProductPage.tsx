import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import api from "../services/api";
import { ApiResponse, Product } from "../types/api";

function SingleProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get<ApiResponse<Product>>(`/products/${productId}`);
        setProduct(response.data.data || null);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      const response = await api.post("/carts/add-item", {
        userId,
        productId: Number(productId),
      });

      toast.success("Product added to cart successfully!");
      console.log("Product added to cart:", response.data);
    } catch (error) {
      toast.error("Error adding product to cart.");
      console.error("Error adding product to cart:", error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="d-flex flex-column min-vh-100 bg-brown-400 px-3 px-md-4 px-lg-5 gap-4"
      style={{ paddingBottom: 80 }}
    >
      <div className="d-flex justify-content-start mt-3 mt-md-0">
        <BackButton />
      </div>
      <Container
        fluid="xl"
        className="d-flex flex-column flex-md-row gap-4 gap-md-5 px-3 px-md-4 py-4 shadow-lg bg-white rounded-4"
      >
        <Row className="g-4 g-md-5 flex-grow-1">
          <Col md={6}>
            <img
              src={product.image}
              alt={product.name}
              className="w-100 h-auto rounded-3"
              style={{ maxHeight: 400, objectFit: "contain" }}
              loading="lazy"
              decoding="async"
            />
          </Col>
          <Col md={6} className="d-flex flex-column gap-4 p-3">
            <p className="text-brown-900 text-uppercase fw-semibold small mb-0">
              {product.categoryName}
            </p>

            <h2 className="fs-1 fw-bold text-heading-black mb-0">
              {product.name}
            </h2>

            <div className="w-100 border-top border-brown-700" />

            <div className="d-flex flex-column gap-3">
              <p className="text-neutral-text-gray fs-4 mb-0">
                {product.description}
              </p>

              <div className="w-100 border-top border-brown-700" />

              <div className="d-flex flex-column gap-3">
                <h3 className="fs-3 fw-semibold text-heading-black mb-0">
                  Services and Support
                </h3>
                <ul className="text-neutral-text-gray fs-4 d-flex flex-column gap-2 mb-0">
                  <li>24/7 customer support available to assist you anytime.</li>
                  <li>Free product setup and installation assistance.</li>
                </ul>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between w-100">
              <p className="fw-semibold mb-0" style={{ fontSize: "2.25rem", color: "#1a1a1a" }}>
                ${product.price}
              </p>
              <Button
                onClick={handleAddToCart}
                text="Add To Cart"
                className="py-2 px-4 w-auto-important"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default SingleProductPage;
