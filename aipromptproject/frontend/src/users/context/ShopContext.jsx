import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addWishlistPrompt,
  deleteWishlistPrompt,
  fetchWishlist,
} from "../services/wishlistService.js";

const CART_KEY = "promptai_cart";

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
  const [wishlist, setWishlist] = useState([]);
  const [cartUnseen, setCartUnseen] = useState(0);
  const [wishlistUnseen, setWishlistUnseen] = useState(0);
  const [purchasedPrompts, setPurchasedPrompts] = useState([]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let cancelled = false;

    async function loadWishlist() {
      try {
        const savedWishlist = await fetchWishlist();
        if (!cancelled) setWishlist(savedWishlist);
      } catch (error) {
        console.error("Failed to load wishlist", error);
      }
    }

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPurchased() {
      try {
        const { fetchPurchasedPrompts } = await import("../services/promptService.js");
        const purchased = await fetchPurchasedPrompts();
        if (!cancelled) setPurchasedPrompts(purchased);
      } catch (error) {
        console.error("Failed to load purchased prompts", error);
      }
    }

    loadPurchased();

    const handlePurchaseSuccess = () => {
      loadPurchased();
    };
    window.addEventListener("promptai:purchase-success", handlePurchaseSuccess);

    return () => {
      cancelled = true;
      window.removeEventListener("promptai:purchase-success", handlePurchaseSuccess);
    };
  }, []);

  const hasPurchased = useCallback(
    (promptId) => purchasedPrompts.some((p) => String(p.id) === String(promptId)),
    [purchasedPrompts]
  );

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
    if (hasPurchased(id)) {
      alert("You have already purchased this prompt.");
      return;
    }
    setCart((prev) => {
      if (prev.some((item) => item.prompt.id === id)) return prev;
      setCartUnseen((count) => count + 1);
      return [...prev, { prompt, addedAt: Date.now() }];
    });
  }, [hasPurchased]);

  const removeFromCart = useCallback((promptId) => {
    setCart((prev) => prev.filter((item) => item.prompt.id !== String(promptId)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback(async (prompt) => {
    const id = String(prompt.id);
    const exists = wishlist.some((p) => p.id === id);

    setWishlist((prev) =>
      exists ? prev.filter((p) => p.id !== id) : [...prev, prompt]
    );
    if (!exists) {
      setWishlistUnseen((count) => count + 1);
    }

    try {
      if (exists) {
        await deleteWishlistPrompt(id);
      } else {
        await addWishlistPrompt(id);
      }
    } catch (error) {
      console.error("Failed to update wishlist", error);
      setWishlist((prev) =>
        exists
          ? prev.some((p) => p.id === id)
            ? prev
            : [...prev, prompt]
          : prev.filter((p) => p.id !== id)
      );
    }
  }, [wishlist]);

  const removeFromWishlist = useCallback(async (promptId) => {
    const id = String(promptId);
    const removedPrompt = wishlist.find((p) => p.id === id);

    setWishlist((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteWishlistPrompt(id);
    } catch (error) {
      console.error("Failed to remove wishlist item", error);
      if (removedPrompt) {
        setWishlist((prev) =>
          prev.some((p) => p.id === id) ? prev : [...prev, removedPrompt]
        );
      }
    }
  }, [wishlist]);

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
      clearCart,
      toggleWishlist,
      removeFromWishlist,
      markCartSeen,
      markWishlistSeen,
      purchaseCart,
      hasPurchased,
      purchasedPrompts,
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
      clearCart,
      toggleWishlist,
      removeFromWishlist,
      markCartSeen,
      markWishlistSeen,
      purchaseCart,
      hasPurchased,
      purchasedPrompts,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
