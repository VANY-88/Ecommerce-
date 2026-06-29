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
    <div className="flex items-center justify-between border-b border-brown-700 pb-4 mb-4">
      <img
        src={item.image || "https://via.placeholder.com/150"}
        alt={item.productName}
        className="w-24 h-24 object-cover rounded-md"
        loading="lazy"
        decoding="async"
      />
      <div className="flex-1 px-4 space-y-3">
        <h3 className="text-xl font-semibold text-heading-black">
          {item.productName}
        </h3>
        <div className="flex space-x-6 items-center">
          <div className="flex items-center text-xl">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="text-gray-500 px-2 py-1 hover:text-orange-500 disabled:opacity-40 disabled:hover:text-gray-500 transition-colors duration-200"
            >
              -
            </button>
            <span className="px-4">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="text-heading-black px-2 py-1 text-bold hover:text-orange-500 transition-colors duration-200"
            >
              +
            </button>
          </div>
          <button
            onClick={() => onRemoveItem(item.id)}
            className="text-brown-1000 text-base font-semibold hover:text-red-600 transition-colors duration-200"
          >
            Remove
          </button>
        </div>
      </div>
      <p className="text-xl font-semibold text-gray-800">
        ${item.price.toFixed(2)}
      </p>
    </div>
  );
};

export default CartItem;
