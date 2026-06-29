import React from "react";
import { CartItem as CartItemType } from "../types/api";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (itemId: number, newQuantity: number) => void;
  onRemoveItem: (itemId: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemoveItem }) => {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      onQuantityChange(item.id, newQuantity);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-between border-bottom border-brown-700 pb-4 mb-4">
      <img
        src={item.image || "https://via.placeholder.com/150"}
        alt={item.productName}
        className="rounded"
        style={{ width: "6rem", height: "6rem", objectFit: "cover" }}
        loading="lazy"
        decoding="async"
      />
      <div className="flex-grow-1 px-4">
        <h3 className="fs-4 fw-semibold text-heading-black">
          {item.productName}
        </h3>
        <div className="d-flex gap-4 align-items-center mt-2">
          <div className="d-flex align-items-center fs-4">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="btn-quantity px-2 py-1 border-0 bg-transparent"
            >
              -
            </button>
            <span className="px-3">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="btn-quantity px-2 py-1 border-0 bg-transparent fw-bold"
            >
              +
            </button>
          </div>
          <button
            onClick={() => onRemoveItem(item.id)}
            className="btn-remove text-brown-1000 fs-6 fw-semibold border-0 bg-transparent"
          >
            Remove
          </button>
        </div>
      </div>
      <p className="fs-4 fw-semibold text-heading-black">
        ${item.price.toFixed(2)}
      </p>
    </div>
  );
};

export default CartItem;
