import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CART_KEY = "promptai_cart";
const WISHLIST_KEY = "promptai_wishlist";

const ShopContext = createContext(null);

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => loadJson(CART_KEY, []));
  const [wishlist, setWishlist] = useState(() => loadJson(WISHLIST_KEY, []));
  const [cartUnseen, setCartUnseen] = useState(0);
  const [wishlistUnseen, setWishlistUnseen] = useState(0);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const isInCart = useCallback(
    (promptId) => cart.some((item) => item.prompt.id === String(promptId)),
    [cart]
  );

  const isInWishlist = useCallback(
    (promptId) => wishlist.some((item) => item.id === String(promptId)),
    [wishlist]
  );

  const addToCart = useCallback((prompt) => {
    const id = String(prompt.id);
    setCart((prev) => {
      if (prev.some((item) => item.prompt.id === id)) return prev;
      setCartUnseen((c) => c + 1);
      return [...prev, { prompt, addedAt: Date.now() }];
    });
  }, []);

  const removeFromCart = useCallback((promptId) => {
    setCart((prev) => prev.filter((item) => item.prompt.id !== String(promptId)));
  }, []);

  const toggleWishlist = useCallback((prompt) => {
    const id = String(prompt.id);
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === id);
      if (exists) return prev.filter((p) => p.id !== id);
      setWishlistUnseen((c) => c + 1);
      return [...prev, prompt];
    });
  }, []);

  const removeFromWishlist = useCallback((promptId) => {
    setWishlist((prev) => prev.filter((p) => p.id !== String(promptId)));
  }, []);

  const markCartSeen = useCallback(() => setCartUnseen(0), []);
  const markWishlistSeen = useCallback(() => setWishlistUnseen(0), []);

  const purchaseCart = useCallback(() => {
    const purchased = [...cart];
    setCart([]);
    setCartUnseen(0);
    return purchased;
  }, [cart]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.prompt.price) || 0), 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      cartCount: cart.length,
      wishlistCount: wishlist.length,
      cartUnseenCount: cartUnseen,
      wishlistUnseenCount: wishlistUnseen,
      cartTotal,
      isInCart,
      isInWishlist,
      addToCart,
      removeFromCart,
      toggleWishlist,
      removeFromWishlist,
      markCartSeen,
      markWishlistSeen,
      purchaseCart,
    }),
    [
      cart,
      wishlist,
      cartUnseen,
      wishlistUnseen,
      cartTotal,
      isInCart,
      isInWishlist,
      addToCart,
      removeFromCart,
      toggleWishlist,
      removeFromWishlist,
      markCartSeen,
      markWishlistSeen,
      purchaseCart,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
