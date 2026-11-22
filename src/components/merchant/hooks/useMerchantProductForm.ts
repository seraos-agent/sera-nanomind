import React, { useState } from "react";
import { getApiBaseUrl } from "../../../config/marketplaceConfig";
import { formatStorePinLocation } from "../../marketplace/utils/formatters";
import {
  type MerchantStore,
  type MerchantProduct,
  type ProductVariant,
  getStoreProductCategories,
  normalizeStoreType
} from "../types";

interface UseMerchantProductFormProps {
  store: MerchantStore | null;
  setStore: React.Dispatch<React.SetStateAction<MerchantStore | null>>;
  setProducts: React.Dispatch<React.SetStateAction<MerchantProduct[]>>;
}

export function useMerchantProductForm({
  store,
  setStore,
  setProducts
}: UseMerchantProductFormProps) {
  // Product Modal States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MerchantProduct | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodNormalPrice, setProdNormalPrice] = useState("");
  const [prodCostPrice, setProdCostPrice] = useState("");
  const [prodDiscountType, setProdDiscountType] = useState<"%" | "nominal">("%");
  const [prodDiscountValue, setProdDiscountValue] = useState("");
  const [prodStock, setProdStock] = useState("20");
  const [prodWeight, setProdWeight] = useState("1000");
  const [prodWeightUnit, setProdWeightUnit] = useState<"g" | "ml">("g");
  const [prodBarcode, setProdBarcode] = useState("");
  const [prodType, setProdType] = useState<"GOODS" | "SERVICE">("GOODS");
  const [prodCategory, setProdCategory] = useState("");
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Category Management & Filter States
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("ALL");
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<MerchantProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [saveToast, setSaveToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleOpenAddProduct = () => {
    setIsSaving(false);
    setIsSuccess(false);
    const sType = normalizeStoreType(store?.type);
    const availableCats = getStoreProductCategories(store?.customCategories);
    setEditingProduct(null);
    setProdName("");
    setProdDescription("");
    setProdNormalPrice("");
    setProdCostPrice("");
    setProdDiscountType("%");
    setProdDiscountValue("");
    setProdStock(sType === "JASA" ? "60 Menit" : "20");
    setProdWeight(sType === "JASA" ? "" : "1000");
    setProdWeightUnit("g");
    setProdBarcode("");
    setProdType(sType === "JASA" ? "SERVICE" : "GOODS");
    setProdCategory(
      selectedCategoryDetail
        ? selectedCategoryDetail
        : availableCats[0] || ""
    );
    setProdImages([]);
    setHasVariants(false);
    setVariants([]);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: MerchantProduct) => {
    setIsSaving(false);
    setIsSuccess(false);
    const availableCats = getStoreProductCategories(store?.customCategories);
    setEditingProduct(p);
    setProdName(p.name);
    setProdDescription(p.description || "");
    if (p.originalPrice && p.originalPrice > p.price) {
      setProdNormalPrice(p.originalPrice.toString());
      if (p.discountType && p.discountValue !== undefined) {
        setProdDiscountType(p.discountType);
        setProdDiscountValue(p.discountValue.toString());
      } else {
        setProdDiscountType("%");
        setProdDiscountValue(
          Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100).toString()
        );
      }
    } else {
      setProdNormalPrice(p.price.toString());
      setProdDiscountType("%");
      setProdDiscountValue("");
    }
    setProdCostPrice(
      p.costPrice !== undefined && p.costPrice > 0 ? p.costPrice.toString() : ""
    );
    setProdStock(p.stock ? p.stock.toString() : p.duration || "60 Menit");
    setProdWeight(p.weight !== undefined && p.weight !== null ? String(p.weight) : (p.type === "SERVICE" ? "" : "1000"));
    setProdWeightUnit(p.weightUnit === "ml" ? "ml" : "g");
    setProdBarcode(p.barcode || "");
    setProdType(p.type);
    setProdCategory(p.category && availableCats.includes(p.category) ? p.category : "");
    setProdImages(p.images && p.images.length > 0 ? [...p.images] : []);
    if (p.variants && p.variants.length > 0) {
      setHasVariants(true);
      setVariants([...p.variants]);
    } else {
      setHasVariants(false);
      setVariants([]);
    }
    setProductModalOpen(true);
  };

  const handleDeleteProduct = (p: MerchantProduct) => {
    setProductToDelete(p);
  };

  const handleConfirmDeleteProduct = async (productId: string) => {
    const target = productToDelete;
    if (target && Array.isArray(target.images)) {
      const apiUrl = getApiBaseUrl();
      for (const imgUrl of target.images) {
        if (
          imgUrl &&
          (imgUrl.includes("cdn.seraos.xyz") ||
            imgUrl.includes("r2.cloudflarestorage.com") ||
            imgUrl.includes("r2.dev"))
        ) {
          fetch(`${apiUrl}/api/upload/media`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: imgUrl })
          }).catch(() => {});
        }
      }
    }

    try {
      await fetch(`${getApiBaseUrl()}/api/market/products/${productId}`, {
        method: "DELETE"
      });
    } catch {}
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setProductToDelete(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (isSaving) return;

    if (!store) {
      setSaveToast({ message: "Data toko belum termuat. Silakan refresh halaman.", type: "error" });
      setTimeout(() => setSaveToast(null), 3000);
      return;
    }

    if (!prodName.trim()) {
      setSaveToast({ message: "Nama produk wajib diisi!", type: "error" });
      setTimeout(() => setSaveToast(null), 3000);
      return;
    }

    // Check if any partially filled variant row is missing its name before filtering empty rows
    if (hasVariants) {
      const unnamedFilledVariant = variants.find(
        (v) =>
          (!v.name || !v.name.trim()) &&
          (Number(v.price) > 0 ||
            (v.costPrice !== undefined && Number(v.costPrice) > 0) ||
            (v.stock !== undefined && Number(v.stock) > 0))
      );
      if (unnamedFilledVariant) {
        setSaveToast({ message: "Nama varian wajib diisi untuk setiap baris yang terisi!", type: "error" });
        setTimeout(() => setSaveToast(null), 3000);
        return;
      }
    }

    // Filter out completely blank variant rows automatically
    const cleanVariants = hasVariants
      ? variants.filter((v) => Boolean(v.name && v.name.trim()))
      : [];

    if (!hasVariants) {
      const cleanPrice = parseInt(prodNormalPrice.replace(/\D/g, ""), 10) || 0;
      if (cleanPrice <= 0) {
        setSaveToast({ message: "Harga produk wajib diisi dengan nominal yang valid!", type: "error" });
        setTimeout(() => setSaveToast(null), 3000);
        return;
      }
    } else {
      if (cleanVariants.length === 0) {
        setSaveToast({ message: "Harap isi minimal 1 varian dengan nama dan harga yang valid!", type: "error" });
        setTimeout(() => setSaveToast(null), 3000);
        return;
      }
      const invalidPriceVariant = cleanVariants.find((v) => !v.price || Number(v.price) <= 0);
      if (invalidPriceVariant) {
        setSaveToast({ message: `Harga untuk varian "${invalidPriceVariant.name}" wajib diisi!`, type: "error" });
        setTimeout(() => setSaveToast(null), 3000);
        return;
      }
    }

    setIsSaving(true);
    setIsSuccess(false);

    try {
      const normalPriceNum = !hasVariants
        ? (parseInt(prodNormalPrice.replace(/[^0-9]/g, ""), 10) || 10000)
        : (cleanVariants[0]?.price || 10000);
      const discVal = prodDiscountValue.trim()
        ? parseFloat(prodDiscountValue.replace(/[^0-9.]/g, ""))
        : 0;

    let finalSellingPrice = normalPriceNum;
    let finalOriginalPrice: number | undefined = undefined;
    let finalDiscountType: "%" | "nominal" | undefined = undefined;
    let finalDiscountValue: number | undefined = undefined;

    if (discVal > 0) {
      if (prodDiscountType === "%") {
        const percent = Math.min(99, Math.max(1, Math.round(discVal)));
        finalSellingPrice = Math.max(
          100,
          Math.round(normalPriceNum * (1 - percent / 100))
        );
        finalOriginalPrice = normalPriceNum;
        finalDiscountType = "%";
        finalDiscountValue = percent;
      } else {
        const nominal = Math.min(
          normalPriceNum - 100,
          Math.max(1, Math.round(discVal))
        );
        finalSellingPrice = Math.max(100, normalPriceNum - nominal);
        finalOriginalPrice = normalPriceNum;
        finalDiscountType = "nominal";
        finalDiscountValue = nominal;
      }
    }

    // Staged Draft Pattern: Upload ONLY final confirmed images to Cloudflare R2 on Save
    // Swapping or cancelling drafts never touches or pollutes Cloudflare R2.
    const resolvedImages: string[] = [];
    const apiUrl = getApiBaseUrl();

    for (let i = 0; i < prodImages.length; i++) {
      const img = prodImages[i];
      if (img.startsWith("data:image/")) {
        try {
          const res = await fetch(`${apiUrl}/api/upload/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dataUrl: img,
              filename: `product_${Date.now()}_${i}.jpg`,
              sessionId: "merchant"
            })
          });
          const data = await res.json();
          if (data?.success && data?.url && !data.url.startsWith("blob:")) {
            resolvedImages.push(data.url);
            continue;
          }
        } catch (uploadErr) {
          console.warn("[useMerchantProductForm] Cloudflare R2 upload fallback:", uploadErr);
        }
      }
      resolvedImages.push(img);
    }

    const finalImages = resolvedImages;
    const itemStatus: "ACTIVE" | "DRAFT" =
      finalImages.length > 0 && finalSellingPrice > 0 ? "ACTIVE" : "DRAFT";

    // Clean up replaced images from Cloudflare R2 when editing an existing product
    if (editingProduct && Array.isArray(editingProduct.images)) {
      for (const oldUrl of editingProduct.images) {
        if (
          (oldUrl.includes("cdn.seraos.xyz") ||
            oldUrl.includes("r2.cloudflarestorage.com") ||
            oldUrl.includes("r2.dev")) &&
          !finalImages.includes(oldUrl)
        ) {
          fetch(`${apiUrl}/api/upload/media`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: oldUrl })
          }).catch(() => {});
        }
      }
    }

    const validVariants = hasVariants
      ? cleanVariants
          .filter((v) => Number(v.price) > 0)
          .map((v) => ({
            ...v,
            costPrice: v.costPrice && Number(v.costPrice) > 0 ? Number(v.costPrice) : undefined
          }))
      : [];
    const finalVariants = validVariants.length > 0 ? validVariants : undefined;
    const finalPrice =
      finalVariants && finalVariants.length > 0
        ? Math.min(...finalVariants.map((v) => v.price || 0))
        : finalSellingPrice;
    const cleanCostNum = parseInt(prodCostPrice.replace(/\D/g, ""), 10) || 0;
    const variantCostCandidates = (finalVariants || [])
      .map((v) => v.costPrice || 0)
      .filter((c) => c > 0);
    const finalCostPrice =
      finalVariants && finalVariants.length > 0
        ? variantCostCandidates.length > 0
          ? Math.min(...variantCostCandidates)
          : undefined
        : cleanCostNum > 0
          ? cleanCostNum
          : undefined;
    const cleanStockNum = parseInt(String(prodStock).replace(/\D/g, ""), 10) || 10;
    const finalStock =
      finalVariants && finalVariants.length > 0 && prodType === "GOODS"
        ? finalVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
        : prodType === "GOODS"
          ? cleanStockNum
          : undefined;
    const cleanWeightNum = parseInt(String(prodWeight).replace(/\D/g, ""), 10) || 0;
    const finalWeight =
      prodType !== "SERVICE" && cleanWeightNum > 0
        ? cleanWeightNum
        : undefined;
    const finalWeightUnit: "g" | "ml" | undefined = finalWeight ? prodWeightUnit : undefined;

    if (editingProduct) {
      const updatedPayload = {
        name: prodName,
        description: prodDescription.trim(),
        type: prodType,
        category: prodCategory,
        price: finalPrice,
        costPrice: finalCostPrice,
        originalPrice: finalOriginalPrice,
        discountType: finalDiscountType,
        discountValue: finalDiscountValue,
        stock: finalStock,
        weight: finalWeight,
        weightUnit: finalWeightUnit,
        barcode: prodBarcode.trim() || undefined,
        duration: prodType === "SERVICE" ? prodStock : undefined,
        images: finalImages,
        status: itemStatus,
        variants: finalVariants,
        addToMasterCatalog: itemStatus === "ACTIVE"
      };

      try {
        await fetch(`${getApiBaseUrl()}/api/market/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPayload)
        });
      } catch {}

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === editingProduct.id) {
            return {
              ...p,
              ...updatedPayload
            };
          }
          return p;
        })
      );
    } else {
      const newProd: MerchantProduct = {
        id: `prod-${Date.now()}`,
        storeId: store.id,
        storeName: store.name,
        name: prodName,
        description: prodDescription.trim() || `Produk unggulan dari ${store.name}.`,
        type: prodType,
        category: prodCategory,
        price: finalPrice,
        costPrice: finalCostPrice,
        originalPrice: finalOriginalPrice,
        discountType: finalDiscountType,
        discountValue: finalDiscountValue,
        currency: "IDR",
        stock: finalStock,
        weight: finalWeight,
        weightUnit: finalWeightUnit,
        barcode: prodBarcode.trim() || undefined,
        duration: prodType === "SERVICE" ? `${prodStock || 60} Menit` : undefined,
        rating: 5.0,
        images: finalImages,
        status: itemStatus,
        variants: finalVariants,
        addToMasterCatalog: itemStatus === "ACTIVE",
        location: formatStorePinLocation({
          city: store.city,
          district: store.district,
          village: store.village,
          address: store.address,
          fallback: store.city
        })
      };

      try {
        await fetch(`${getApiBaseUrl()}/api/market/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProd)
        });
      } catch {}

      setProducts((prev) => [newProd, ...prev]);
      if (itemStatus === "ACTIVE") {
        setStore((prev) =>
          prev ? { ...prev, totalProducts: (prev.totalProducts || 0) + 1 } : null
        );
      }
    }

    setIsSaving(false);
    setIsSuccess(true);

    // Brief animation pause for checkmark transition
    await new Promise((resolve) => setTimeout(resolve, 600));

    setProductModalOpen(false);
    setIsSuccess(false);

    const msg =
      itemStatus === "DRAFT"
        ? "Disimpan ke Draft (tambahkan foto untuk menerbitkan)"
        : editingProduct?.status === "DRAFT"
          ? "Produk berhasil diterbitkan"
          : editingProduct
            ? "Perubahan disimpan"
            : "Produk tersimpan";
    setSaveToast({ message: msg, type: "success" });
    setTimeout(() => setSaveToast(null), 2500);
  } catch (err) {
    console.warn("[useMerchantProductForm] Save product failed:", err);
    setIsSaving(false);
    setIsSuccess(false);
    setSaveToast({ message: "Gagal menyimpan produk. Silakan coba lagi.", type: "error" });
    setTimeout(() => setSaveToast(null), 3200);
  }
};

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed || !store) return;
    if (trimmed.toLowerCase() === "umum") {
      setNewCategoryName("");
      setIsAddingCategory(false);
      return;
    }

    const syncStoreCategories = async (storeId: string, categories: string[]) => {
      try {
        await fetch(`${getApiBaseUrl()}/api/market/stores/${storeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customCategories: categories })
        });
      } catch (err) {
        console.warn("Could not sync customCategories to backend:", err);
      }
    };

    const existingCustoms = store.customCategories || [];
    if (!existingCustoms.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      const updatedCustoms = [...existingCustoms, trimmed];
      const updatedStore: MerchantStore = {
        ...store,
        customCategories: updatedCustoms
      };
      setStore(updatedStore);
      void syncStoreCategories(store.id, updatedCustoms);
    }
    setNewCategoryName("");
    setIsAddingCategory(false);
    setSelectedFilterCategory("KATEGORI");
    setSelectedCategoryDetail(null);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (!store) return;
    const updatedCustoms = (store.customCategories || []).filter(
      (c) => c !== catToDelete
    );
    setStore({ ...store, customCategories: updatedCustoms });
    void fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customCategories: updatedCustoms })
    }).catch(() => {});

    // Migrate any products that were in the deleted category to unassigned ""
    setProducts((prev) =>
      prev.map((p) => (p.category === catToDelete ? { ...p, category: "" } : p))
    );

    if (selectedCategoryDetail === catToDelete) {
      setSelectedCategoryDetail(null);
    }
    if (prodCategory === catToDelete) {
      setProdCategory(updatedCustoms[0] || "");
    }
  };

  return {
    productModalOpen,
    setProductModalOpen,
    editingProduct,
    setEditingProduct,
    prodName,
    setProdName,
    prodDescription,
    setProdDescription,
    prodNormalPrice,
    setProdNormalPrice,
    prodCostPrice,
    setProdCostPrice,
    prodDiscountType,
    setProdDiscountType,
    prodDiscountValue,
    setProdDiscountValue,
    prodStock,
    setProdStock,
    prodWeight,
    setProdWeight,
    prodWeightUnit,
    setProdWeightUnit,
    prodBarcode,
    setProdBarcode,
    prodType,
    setProdType,
    prodCategory,
    setProdCategory,
    prodImages,
    setProdImages,
    hasVariants,
    setHasVariants,
    variants,
    setVariants,
    newCategoryName,
    setNewCategoryName,
    selectedFilterCategory,
    setSelectedFilterCategory,
    selectedCategoryDetail,
    setSelectedCategoryDetail,
    isAddingCategory,
    setIsAddingCategory,
    categoryToDelete,
    setCategoryToDelete,
    productToDelete,
    setProductToDelete,
    isSaving,
    isSuccess,
    saveToast,
    handleOpenAddProduct,
    handleOpenEditProduct,
    handleDeleteProduct,
    handleConfirmDeleteProduct,
    handleSaveProduct,
    handleSaveCategory,
    handleDeleteCategory
  };
}

