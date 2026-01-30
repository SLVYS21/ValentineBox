import { Product } from "@/types/api.types";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  removeItemQuantity: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // const addItem = (item: Omit<CartItem, "quantity">) => {
  //   setItems((prev) => {
  //     const existing = prev.find((i) => i.id === item.id);
  //     if (existing) {
  //       return prev.map((i) =>
  //         i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
  //       );
  //     }
  //     return [...prev, { ...item, quantity: 1 }];
  //   });
  // };

  // const removeItem = (id: number) => {
  //   setItems((prev) => prev.filter((item) => item.id !== id));
  // };

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product._id);

      if (existing) {
        return prev.map((i) =>
          i.id === product._id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }

      const primaryImage =
        product.images.find((img) => img.is_primary)?.url ||
        product.images[0]?.url ||
        "";

      const newItem: CartItem = {
        id: product._id,
        name: product.name,
        price: product.price,
        image: primaryImage,
        quantity: 1,
      };

      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  //   const removeItemQuantity = (productId: number) => {
  //   setItems((prev) =>
  //     prev
  //       .map((item) =>
  //         item.id === productId
  //           ? { ...item, quantity: item.quantity - 1 }
  //           : item,
  //       )
  //       .filter((item) => item.quantity > 0),
  //   );
  // };

  const removeItemQuantity = (productId: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        removeItemQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
