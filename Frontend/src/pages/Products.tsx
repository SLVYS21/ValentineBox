// import { Plus, Package, Search, Edit, History } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// const products = [
//   {
//     id: 1,
//     name: "Bouquet Royal 50 Roses",
//     description: "Roses rouges fraîches importées.",
//     price: "35 000 FCFA",
//     stock: 12,
//     emoji: "🌹",
//   },
//   {
//     id: 2,
//     name: "Coffret Chocolats Cœur",
//     description: "Assortiment praliné fin.",
//     price: "15 000 FCFA",
//     stock: 45,
//     emoji: "🍫",
//   },
//   {
//     id: 3,
//     name: "Ours Géant 1m50",
//     description: "Peluche ultra douce premium.",
//     price: "40 000 FCFA",
//     stock: 5,
//     emoji: "🧸",
//   },
//   {
//     id: 4,
//     name: "Collier Or & Rubis",
//     description: "Plaque or 18 carats.",
//     price: "65 000 FCFA",
//     stock: 8,
//     emoji: "💎",
//   },
//   {
//     id: 5,
//     name: "Pack Duo Montres",
//     description: "Pour lui et pour elle.",
//     price: "55 000 FCFA",
//     stock: 10,
//     emoji: "⌚",
//   },
//   {
//     id: 6,
//     name: "Parfum 'Amour Éternel'",
//     description: "Eau de parfum florale.",
//     price: "25 000 FCFA",
//     stock: 20,
//     emoji: "🌸",
//   },
// ];

// export default function Products() {
//   return (
//     <div className="space-y-6">
//       {/* Header with search and actions */}
//       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//         <div className="relative w-full sm:w-80">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Rechercher un produit..."
//             className="pl-10"
//           />
//         </div>
//         <div className="flex gap-2">
//           <Button className="gap-2">
//             <Plus className="h-4 w-4" />
//             Nouveau Produit
//           </Button>
//           <Button variant="outline" className="gap-2">
//             <Package className="h-4 w-4" />
//             Créer un Pack
//           </Button>
//         </div>
//       </div>

//       {/* Products Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         {products.map((product) => (
//           <div
//             key={product.id}
//             className="bg-card rounded-xl border border-border shadow-card overflow-hidden card-hover"
//           >
//             <div className="h-40 bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-6xl">
//               {product.emoji}
//             </div>
//             <div className="p-4 space-y-3">
//               <div className="flex items-start justify-between gap-2">
//                 <h3 className="font-semibold text-foreground text-sm leading-tight font-sans">
//                   {product.name}
//                 </h3>
//                 <p className="text-sm font-bold text-primary whitespace-nowrap">
//                   {product.price}
//                 </p>
//               </div>
//               <p className="text-xs text-muted-foreground">{product.description}</p>
//               <div className="flex items-center justify-between pt-2 border-t border-border">
//                 <p className="text-xs text-muted-foreground">
//                   Stock: <span className="font-semibold text-foreground">{product.stock} unités</span>
//                 </p>
//                 <div className="flex gap-1">
//                   <Button variant="ghost" size="icon" className="h-8 w-8">
//                     <Edit className="h-4 w-4" />
//                   </Button>
//                   <Button variant="ghost" size="icon" className="h-8 w-8">
//                     <History className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Add New Product Card */}
//         <button className="bg-card rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-secondary/50 transition-colors min-h-[280px] flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary">
//           <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
//             <Plus className="h-6 w-6" />
//           </div>
//           <span className="font-medium">Ajouter un produit</span>
//         </button>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import {
  Plus,
  Package,
  Search,
  Edit,
  History,
  Trash2,
  Upload,
  AlertCircle,
  TrendingUp,
  Image as ImageIcon,
  ShoppingBag,
  Gift,
  Eye,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { productService } from "@/services/product.service";
import { packService } from "@/services/pack.service";
import {
  Product,
  ProductCategory,
  ProductQueryParams,
  Pack,
  PackCategory,
  PackOccasion,
  PackTheme,
  PackItem,
} from "@/types/api.types";

type ViewMode = "products" | "packs";

type ProductCardProps = {
  product: Product;
  openEditDialog: (p: Product) => void;
  handleViewHistory: (p: Product) => void;
  openStockDialog: (p: Product) => void;
  setSelectedProduct: (p: Product) => void;
  setIsImageDialogOpen: (v: boolean) => void;
};

function ProductCard({
  product,
  openEditDialog,
  handleViewHistory,
  openStockDialog,
  setSelectedProduct,
  setIsImageDialogOpen,
}: ProductCardProps) {
  const images = product.images || [];

  const primaryIndex =
    images.findIndex((img) => img.is_primary) >= 0
      ? images.findIndex((img) => img.is_primary)
      : 0;

  const [imageIndex, setImageIndex] = useState(primaryIndex);

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Format currency
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  // Get stock status badge
  const getStockBadge = (status: string) => {
    const badges = {
      in_stock: <Badge className="bg-green-500">En stock</Badge>,
      low_stock: <Badge className="bg-yellow-500">Stock faible</Badge>,
      out_of_stock: <Badge className="bg-red-500">Rupture</Badge>,
    };
    return badges[status as keyof typeof badges] || null;
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden card-hover">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-secondary to-accent overflow-hidden group">
        {images.length > 0 ? (
          <>
            <img
              src={images[imageIndex].url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2
                  bg-black/50 text-white rounded-full p-1
                  opacity-0 group-hover:opacity-100 transition"
                >
                  ‹
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2
                  bg-black/50 text-white rounded-full p-1
                  opacity-0 group-hover:opacity-100 transition"
                >
                  ›
                </button>
              </>
            )}

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setImageIndex(idx)}
                  className={`h-2 w-2 rounded-full transition
                    ${
                      idx === imageIndex
                        ? "bg-white"
                        : "bg-white/50 hover:bg-white"
                    }`}
                />
              ))}
            </div>
          </>
        ) : (
          // <Package className="h-16 w-16 text-muted-foreground" />
          <div className="flex items-center justify-center h-full bg-gray-200">
          <img width="96" height="96" src="https://img.icons8.com/deco/96/image.png" alt="image"/>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-sm">
            {product.name}
          </h3>
          <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
            {formatPrice(product.price)}
          </p>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-2">
          {getStockBadge(product.stock.status)}
          {product.isFeatured && <Badge variant="outline">Vedette</Badge>}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Stock:{" "}
            <span className="font-semibold text-foreground">
              {product.stock.available} unités
            </span>
          </p>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDialog(product)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewHistory(product)}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openStockDialog(product)}
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedProduct(product);
                setIsImageDialogOpen(true);
              }}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("products");

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stockAlerts, setStockAlerts] = useState<Product[]>([]);

  // Packs state
  const [packs, setPacks] = useState<Pack[]>([]);
  const [packLoading, setPackLoading] = useState(false);
  const [packSearchQuery, setPackSearchQuery] = useState("");
  const [packCategoryFilter, setPackCategoryFilter] = useState<
    PackCategory | "all"
  >("all");
  const [packOccasionFilter, setPackOccasionFilter] = useState<
    PackOccasion | "all"
  >("all");
  const [packCurrentPage, setPackCurrentPage] = useState(1);
  const [packTotalPages, setPackTotalPages] = useState(1);
  const [packStatistics, setPackStatistics] = useState<any>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);

  // Pack dialogs
  const [isCreatePackDialogOpen, setIsCreatePackDialogOpen] = useState(false);
  const [isEditPackDialogOpen, setIsEditPackDialogOpen] = useState(false);
  const [isDeletePackDialogOpen, setIsDeletePackDialogOpen] = useState(false);
  const [isPackImageDialogOpen, setIsPackImageDialogOpen] = useState(false);
  const [isPackStatsDialogOpen, setIsPackStatsDialogOpen] = useState(false);
  const [isPackDetailsDialogOpen, setIsPackDetailsDialogOpen] = useState(false);

  // Selected product for operations
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "bouquets" as ProductCategory,
    tags: "",
    isActive: true,
    isFeatured: false,
    stockQuantity: 0,
    stockThreshold: 5,
  });

  // Pack form data
  const [packFormData, setPackFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    category: "budget_moyen" as PackCategory,
    occasion: "saint_valentin" as PackOccasion,
    theme: "romantique" as PackTheme | undefined,
    tags: "",
    isActive: true,
    isFeatured: false,
    packPrice: 0,
    availableQuantity: 0,
    items: [] as PackItem[],
  });

  // Pack item form
  const [packItemForm, setPackItemForm] = useState({
    productId: "",
    quantity: 1,
  });

  // Stock adjustment form
  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: 0,
    reason: "",
  });

  // Image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isPrimaryImage, setIsPrimaryImage] = useState(false);
  const [imageAlt, setImageAlt] = useState("");

  // Stock history and statistics
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [stockStatistics, setStockStatistics] = useState<any>(null);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: ProductQueryParams = {
        page: currentPage,
        limit: 12,
        search: searchQuery || undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      };

      const response = await productService.getProducts(params);

      if (response.success && response.data) {
        setProducts(response.data);
        setTotalPages(response.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 1000 });
      if (response.success && response.data) {
        setAllProducts(response.data);
      }
    } catch (err) {
      console.error("Error fetching all products:", err);
    }
  };

  // Fetch stock alerts
  const fetchStockAlerts = async () => {
    try {
      const response = await productService.getStockAlerts();
      if (response.success && response.data) {
        setStockAlerts(response.data);
      }
    } catch (err) {
      console.error("Error fetching stock alerts:", err);
    }
  };

  // Create product
  const handleCreateProduct = async () => {
    try {
      setError(null);

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        stock: {
          quantity: formData.stockQuantity,
          threshold: formData.stockThreshold,
        },
      };

      const response = await productService.createProduct(productData);

      if (response.success) {
        setIsCreateDialogOpen(false);
        resetForm();
        fetchProducts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create product");
      console.error("Error creating product:", err);
    }
  };

  // Update product
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      setError(null);

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      };

      const response = await productService.updateProduct(
        selectedProduct._id,
        productData,
      );

      if (response.success) {
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        resetForm();
        fetchProducts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update product");
      console.error("Error updating product:", err);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setError(null);
      const response = await productService.deleteProduct(selectedProduct._id);

      if (response.success) {
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
      console.error("Error deleting product:", err);
    }
  };

  // Upload image
  const handleUploadImage = async () => {
    if (!selectedProduct || !selectedImage) return;

    try {
      setError(null);
      const response = await productService.uploadImage(
        selectedProduct._id,
        selectedImage,
        isPrimaryImage,
      );

      if (response.success) {
        setIsImageDialogOpen(false);
        setSelectedImage(null);
        setIsPrimaryImage(false);
        fetchProducts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
      console.error("Error uploading image:", err);
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId: string) => {
    if (!selectedProduct) return;

    try {
      setError(null);
      const response = await productService.deleteImage(
        selectedProduct._id,
        imageId,
      );

      if (response.success) {
        fetchProducts();
        // Update selected product if viewing images
        if (response.data) {
          setSelectedProduct(response.data);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete image");
      console.error("Error deleting image:", err);
    }
  };

  // Adjust stock
  const handleAdjustStock = async () => {
    if (!selectedProduct) return;

    try {
      setError(null);
      const response = await productService.adjustStock(
        selectedProduct._id,
        stockAdjustment.quantity,
        stockAdjustment.reason,
      );

      if (response.success) {
        setIsStockDialogOpen(false);
        setStockAdjustment({ quantity: 0, reason: "" });
        fetchProducts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to adjust stock");
      console.error("Error adjusting stock:", err);
    }
  };

  // Fetch stock history
  const handleViewHistory = async (product: Product) => {
    setSelectedProduct(product);
    try {
      setError(null);
      const response = await productService.getStockHistory(product._id, 50);
      if (response.success && response.data) {
        setStockHistory(response.data);
      }
      setIsHistoryDialogOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to fetch stock history");
      console.error("Error fetching stock history:", err);
    }
  };

  // Fetch stock statistics
  const handleViewStatistics = async (product: Product) => {
    setSelectedProduct(product);
    try {
      setError(null);
      const response = await productService.getStockStatistics(product._id);
      if (response.success && response.data) {
        setStockStatistics(response.data);
      }
      setIsStatsDialogOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to fetch statistics");
      console.error("Error fetching statistics:", err);
    }
  };

  // Open edit dialog
  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      tags: product.tags.join(", "),
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      stockQuantity: product.stock.quantity,
      stockThreshold: product.stock.threshold,
    });
    setIsEditDialogOpen(true);
  };

  // Open stock adjustment dialog
  const openStockDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsStockDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "bouquets",
      tags: "",
      isActive: true,
      isFeatured: false,
      stockQuantity: 0,
      stockThreshold: 5,
    });
  };

  // ==================== PACKS FUNCTIONS ====================

  const fetchPacks = async () => {
    try {
      setPackLoading(true);
      setError(null);

      const params: any = {
        page: packCurrentPage,
        limit: 12,
      };

      if (packSearchQuery) params.search = packSearchQuery;
      if (packCategoryFilter !== "all") params.category = packCategoryFilter;
      if (packOccasionFilter !== "all") params.occasion = packOccasionFilter;

      const response = await packService.getPacks(params);

      if (response.success && response.data) {
        setPacks(response.data);
        setPackTotalPages(response.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch packs");
      console.error("Error fetching packs:", err);
    } finally {
      setPackLoading(false);
    }
  };

  const fetchPackStatistics = async () => {
    try {
      const response = await packService.getStatistics();
      if (response.success && response.data) {
        setPackStatistics(response.data);
      }
    } catch (err) {
      console.error("Error fetching pack statistics:", err);
    }
  };

  const handleCreatePack = async () => {
    try {
      setError(null);

      // Calculate prices
      const items = packFormData.items.map((item) => {
        const product = allProducts.find((p) => p._id === item.product);
        return {
          product: item.product,
          quantity: item.quantity,
          priceAtCreation: product?.price || 0,
        };
      });

      const originalPrice = items.reduce(
        (sum, item) => sum + item.priceAtCreation * item.quantity,
        0,
      );
      const discount = originalPrice - packFormData.packPrice;
      const discountPercentage = (discount / originalPrice) * 100;

      const packData = {
        name: packFormData.name,
        slug:
          packFormData.slug ||
          packFormData.name.toLowerCase().replace(/\s+/g, "-"),
        description: packFormData.description,
        shortDescription: packFormData.shortDescription,
        items,
        packPrice: packFormData.packPrice,
        originalPrice,
        discount,
        discountPercentage,
        category: packFormData.category,
        occasion: packFormData.occasion,
        theme: packFormData.theme,
        tags: packFormData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isActive: packFormData.isActive,
        isFeatured: packFormData.isFeatured,
        availableQuantity: packFormData.availableQuantity,
      };

      const response = await packService.createPack(packData);

      if (response.success) {
        setIsCreatePackDialogOpen(false);
        resetPackForm();
        fetchPacks();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create pack");
      console.error("Error creating pack:", err);
    }
  };

  const handleUpdatePack = async () => {
    if (!selectedPack) return;

    try {
      setError(null);

      // Calculate prices
      const items = packFormData.items.map((item) => {
        const product = allProducts.find((p) => p._id === item.product);
        return {
          product: item.product,
          quantity: item.quantity,
          priceAtCreation: product?.price || 0,
        };
      });

      const originalPrice = items.reduce(
        (sum, item) => sum + item.priceAtCreation * item.quantity,
        0,
      );
      const discount = originalPrice - packFormData.packPrice;
      const discountPercentage = (discount / originalPrice) * 100;

      const packData = {
        name: packFormData.name,
        slug: packFormData.slug,
        description: packFormData.description,
        shortDescription: packFormData.shortDescription,
        items,
        packPrice: packFormData.packPrice,
        originalPrice,
        discount,
        discountPercentage,
        category: packFormData.category,
        occasion: packFormData.occasion,
        theme: packFormData.theme,
        tags: packFormData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isActive: packFormData.isActive,
        isFeatured: packFormData.isFeatured,
        availableQuantity: packFormData.availableQuantity,
      };

      const response = await packService.updatePack(selectedPack._id, packData);

      if (response.success) {
        setIsEditPackDialogOpen(false);
        setSelectedPack(null);
        resetPackForm();
        fetchPacks();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update pack");
      console.error("Error updating pack:", err);
    }
  };

  const handleDeletePack = async () => {
    if (!selectedPack) return;

    try {
      setError(null);
      const response = await packService.deletePack(selectedPack._id);

      if (response.success) {
        setIsDeletePackDialogOpen(false);
        setSelectedPack(null);
        fetchPacks();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete pack");
      console.error("Error deleting pack:", err);
    }
  };

  const handleUploadPackImage = async () => {
    if (!selectedPack || !selectedImage) return;

    try {
      setError(null);
      const response = await packService.uploadImage(
        selectedPack._id,
        selectedImage,
        imageAlt,
        isPrimaryImage,
      );

      if (response.success) {
        setIsPackImageDialogOpen(false);
        setSelectedImage(null);
        setIsPrimaryImage(false);
        setImageAlt("");
        fetchPacks();
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
      console.error("Error uploading image:", err);
    }
  };

  const handleViewPackDetails = async (pack: Pack) => {
    setSelectedPack(pack);
    setIsPackDetailsDialogOpen(true);
  };

  const openEditPackDialog = (pack: Pack) => {
    setSelectedPack(pack);

    const items = pack.items.map((item) => ({
      product:
        typeof item.product === "string" ? item.product : item.product._id,
      quantity: item.quantity,
      priceAtCreation: item.priceAtCreation,
    }));

    setPackFormData({
      name: pack.name,
      slug: pack.slug,
      description: pack.description,
      shortDescription: pack.shortDescription || "",
      category: pack.category,
      occasion: pack.occasion,
      theme: pack.theme,
      tags: pack.tags.join(", "),
      isActive: pack.isActive,
      isFeatured: pack.isFeatured,
      packPrice: pack.packPrice,
      availableQuantity: pack.availableQuantity,
      items,
    });
    setIsEditPackDialogOpen(true);
  };

  const addPackItem = () => {
    if (!packItemForm.productId) return;

    const product = allProducts.find((p) => p._id === packItemForm.productId);
    if (!product) return;

    setPackFormData({
      ...packFormData,
      items: [
        ...packFormData.items,
        {
          product: packItemForm.productId,
          quantity: packItemForm.quantity,
          priceAtCreation: product.price,
        } as PackItem,
      ],
    });

    setPackItemForm({ productId: "", quantity: 1 });
  };

  const removePackItem = (index: number) => {
    setPackFormData({
      ...packFormData,
      items: packFormData.items.filter((_, i) => i !== index),
    });
  };

  const resetPackForm = () => {
    setPackFormData({
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      category: "budget_moyen",
      occasion: "saint_valentin",
      theme: "romantique",
      tags: "",
      isActive: true,
      isFeatured: false,
      packPrice: 0,
      availableQuantity: 0,
      items: [],
    });
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (viewMode === "products") {
      fetchProducts();
      fetchStockAlerts();
    } else {
      fetchPacks();
      fetchPackStatistics();
    }
  }, [
    viewMode,
    currentPage,
    searchQuery,
    categoryFilter,
    packCurrentPage,
    packSearchQuery,
    packCategoryFilter,
    packOccasionFilter,
  ]);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // ==================== HELPERS ====================

  const getPackStockBadge = (status: string) => {
    const badges = {
      available: <Badge className="bg-green-500">Disponible</Badge>,
      limited: <Badge className="bg-yellow-500">Limité</Badge>,
      out_of_stock: <Badge className="bg-red-500">Épuisé</Badge>,
    };
    return badges[status as keyof typeof badges] || null;
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  const getProductName = (productId: string) => {
    const product = allProducts.find(p => p._id === productId);
    return product?.name || "Produit inconnu";
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stock Alerts - Only for products */}
      {viewMode === "products" && stockAlerts.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {stockAlerts.length} produit(s) avec stock faible ou en rupture
          </AlertDescription>
        </Alert>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 border-b pb-4">
        <Button
          variant={viewMode === "products" ? "default" : "outline"}
          onClick={() => setViewMode("products")}
          className="gap-2"
        >
          <ShoppingBag className="h-4 w-4" />
          Produits
        </Button>
        <Button
          variant={viewMode === "packs" ? "default" : "outline"}
          onClick={() => setViewMode("packs")}
          className="gap-2"
        >
          <Gift className="h-4 w-4" />
          Packs
        </Button>
        
        {viewMode === "packs" && packStatistics && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPackStatsDialogOpen(true)}
            className="ml-auto gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Statistiques
          </Button>
        )}
      </div>

      {/* Products View */}
      {viewMode === "products" && (
        <>

      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) =>
              setCategoryFilter(value as ProductCategory | "all")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="bouquets">Bouquets</SelectItem>
              <SelectItem value="chocolats">Chocolats</SelectItem>
              <SelectItem value="peluches">Peluches</SelectItem>
              <SelectItem value="bijoux">Bijoux</SelectItem>
              <SelectItem value="parfums">Parfums</SelectItem>
              <SelectItem value="coffrets">Coffrets</SelectItem>
              <SelectItem value="autres">Autres</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Produit
          </Button>
          {/* <Button variant="outline" className="gap-2">
            <Package className="h-4 w-4" />
            Créer un Pack
          </Button> */}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucun produit trouvé
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              openEditDialog={openEditDialog}
              handleViewHistory={handleViewHistory}
              openStockDialog={openStockDialog}
              setSelectedProduct={setSelectedProduct}
              setIsImageDialogOpen={setIsImageDialogOpen}
            />
          ))}

          {/* Add New Product Card */}
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-card rounded-xl border-2 border-dashed border-border hover:border-gray-400 hover:bg-gray-100/50 transition-colors min-h-[280px] flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-gray-700"
          >
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-medium">Ajouter un produit</span>
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}</>
      )}

      {/* Packs View */}
      {viewMode === "packs" && (
        <>
          {/* Header with search and actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un pack..."
                  className="pl-10"
                  value={packSearchQuery}
                  onChange={(e) => setPackSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={packCategoryFilter}
                onValueChange={(value) => setPackCategoryFilter(value as PackCategory | "all")}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  <SelectItem value="petit_budget">Petit budget</SelectItem>
                  <SelectItem value="budget_moyen">Budget moyen</SelectItem>
                  <SelectItem value="budget_confortable">Budget confortable</SelectItem>
                  <SelectItem value="budget_premium">Budget premium</SelectItem>
                  <SelectItem value="budget_luxe">Budget luxe</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={packOccasionFilter}
                onValueChange={(value) => setPackOccasionFilter(value as PackOccasion | "all")}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes occasions</SelectItem>
                  <SelectItem value="saint_valentin">Saint-Valentin</SelectItem>
                  <SelectItem value="anniversaire">Anniversaire</SelectItem>
                  <SelectItem value="declaration">Déclaration</SelectItem>
                  <SelectItem value="reconciliation">Réconciliation</SelectItem>
                  <SelectItem value="cadeau_surprise">Cadeau surprise</SelectItem>
                  <SelectItem value="toutes_occasions">Toutes occasions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsCreatePackDialogOpen(true)} className="gap-2">
              <Package className="h-4 w-4" />
              Créer un Pack
            </Button>
          </div>

          {/* Packs Grid - Continued in next message due to length */}
          {packLoading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : packs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun pack trouvé
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {packs.map((pack) => (
                <div
                  key={pack._id}
                  className="bg-card rounded-xl border border-border shadow-card overflow-hidden card-hover"
                >
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center overflow-hidden relative">
                    {pack.images && pack.images.length > 0 ? (
                      <img
                        src={pack.images.find(img => img.isPrimary)?.url || pack.images[0].url}
                        alt={pack.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Gift className="h-16 w-16 text-white" />
                    )}
                    {pack.discountPercentage > 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-500">
                        -{pack.discountPercentage.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground text-sm leading-tight font-sans">
                        {pack.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(pack.originalPrice)}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {formatPrice(pack.packPrice)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {pack.shortDescription || pack.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPackStockBadge(pack.stockStatus)}
                      {pack.isFeatured && (
                        <Badge variant="outline">Vedette</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {pack.items.length} produits
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Qté: <span className="font-semibold text-foreground">{pack.availableQuantity}</span>
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewPackDetails(pack)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditPackDialog(pack)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedPack(pack);
                            setIsPackImageDialogOpen(true);
                          }}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedPack(pack);
                            setIsDeletePackDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Pack Card */}
              <button
                onClick={() => setIsCreatePackDialogOpen(true)}
                className="bg-card rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-secondary/50 transition-colors min-h-[320px] flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary"
              >
                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="font-medium">Créer un pack</span>
              </button>
            </div>
          )}

          {/* Pagination */}
          {packTotalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPackCurrentPage(p => Math.max(1, p - 1))}
                disabled={packCurrentPage === 1}
              >
                Précédent
              </Button>
              <span className="flex items-center px-4">
                Page {packCurrentPage} sur {packTotalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPackCurrentPage(p => Math.min(packTotalPages, p + 1))}
                disabled={packCurrentPage === packTotalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Product Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedProduct(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen
                ? "Créer un nouveau produit"
                : "Modifier le produit"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      category: value as ProductCategory,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bouquets">Bouquets</SelectItem>
                    <SelectItem value="chocolats">Chocolats</SelectItem>
                    <SelectItem value="peluches">Peluches</SelectItem>
                    <SelectItem value="bijoux">Bijoux</SelectItem>
                    <SelectItem value="parfums">Parfums</SelectItem>
                    <SelectItem value="coffrets">Coffrets</SelectItem>
                    <SelectItem value="autres">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="saint-valentin, romantique"
                />
              </div>
            </div>
            {isCreateDialogOpen && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Quantité initiale</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockThreshold">Seuil d'alerte</Label>
                  <Input
                    id="stockThreshold"
                    type="number"
                    value={formData.stockThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockThreshold: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Produit actif</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked })
                  }
                />
                <Label htmlFor="isFeatured">Produit vedette</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={
                isCreateDialogOpen ? handleCreateProduct : handleUpdateProduct
              }
            >
              {isCreateDialogOpen ? "Créer" : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{selectedProduct?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Management Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Gérer les images - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Télécharger</TabsTrigger>
              <TabsTrigger value="manage">Gérer</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Sélectionner une image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedImage(e.target.files?.[0] || null)
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPrimary"
                  checked={isPrimaryImage}
                  onCheckedChange={setIsPrimaryImage}
                />
                <Label htmlFor="isPrimary">Image principale</Label>
              </div>
              <Button onClick={handleUploadImage} disabled={!selectedImage}>
                <Upload className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </TabsContent>
            <TabsContent value="manage">
              <div className="grid grid-cols-3 gap-4">
                {selectedProduct?.images.map((image) => (
                  <div key={image._id} className="relative group">
                    <img
                      src={image.url}
                      alt="Product"
                      className="w-full h-32 object-cover rounded"
                    />
                    {image.is_primary && (
                      <Badge className="absolute top-2 left-2">Principal</Badge>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => image._id && handleDeleteImage(image._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Ajuster le stock - {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Stock actuel: {selectedProduct?.stock.available} unités
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantité (+ pour ajouter, - pour retirer)
              </Label>
              <Input
                id="quantity"
                type="number"
                value={stockAdjustment.quantity}
                onChange={(e) =>
                  setStockAdjustment({
                    ...stockAdjustment,
                    quantity: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Raison</Label>
              <Textarea
                id="reason"
                value={stockAdjustment.reason}
                onChange={(e) =>
                  setStockAdjustment({
                    ...stockAdjustment,
                    reason: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStockDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleAdjustStock}>Ajuster</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Historique du stock - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {stockHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun historique disponible
              </p>
            ) : (
              stockHistory.map((entry, index) => (
                <div key={index} className="border rounded p-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {entry.quantity > 0 ? "+" : ""}
                      {entry.quantity} unités
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-sm">{entry.reason}</p>
                  {entry.performedBy && (
                    <p className="text-xs text-muted-foreground">
                      Par: {entry.performedBy}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Statistics Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Statistiques - {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {stockStatistics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-3">
                  <p className="text-sm text-muted-foreground">Vues</p>
                  <p className="text-2xl font-bold">
                    {stockStatistics.views || 0}
                  </p>
                </div>
                <div className="border rounded p-3">
                  <p className="text-sm text-muted-foreground">Achats</p>
                  <p className="text-2xl font-bold">
                    {stockStatistics.purchases || 0}
                  </p>
                </div>
                <div className="border rounded p-3">
                  <p className="text-sm text-muted-foreground">Note moyenne</p>
                  <p className="text-2xl font-bold">
                    {stockStatistics.rating || 0}/5
                  </p>
                </div>
                <div className="border rounded p-3">
                  <p className="text-sm text-muted-foreground">Avis</p>
                  <p className="text-2xl font-bold">
                    {stockStatistics.reviewCount || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== PACK DIALOGS ==================== */}

      {/* Create/Edit Pack Dialog */}
      <Dialog open={isCreatePackDialogOpen || isEditPackDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreatePackDialogOpen(false);
          setIsEditPackDialogOpen(false);
          setSelectedPack(null);
          resetPackForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreatePackDialogOpen ? "Créer un nouveau pack" : "Modifier le pack"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packName">Nom du pack</Label>
                <Input
                  id="packName"
                  value={packFormData.name}
                  onChange={(e) => setPackFormData({ ...packFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packSlug">Slug (URL)</Label>
                <Input
                  id="packSlug"
                  value={packFormData.slug}
                  onChange={(e) => setPackFormData({ ...packFormData, slug: e.target.value })}
                  placeholder="pack-saint-valentin-2024"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="packDescription">Description</Label>
              <Textarea
                id="packDescription"
                value={packFormData.description}
                onChange={(e) => setPackFormData({ ...packFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="packShortDescription">Description courte</Label>
              <Input
                id="packShortDescription"
                value={packFormData.shortDescription}
                onChange={(e) => setPackFormData({ ...packFormData, shortDescription: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packCategory">Catégorie</Label>
                <Select
                  value={packFormData.category}
                  onValueChange={(value) => setPackFormData({ ...packFormData, category: value as PackCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petit_budget">Petit budget</SelectItem>
                    <SelectItem value="budget_moyen">Budget moyen</SelectItem>
                    <SelectItem value="budget_confortable">Budget confortable</SelectItem>
                    <SelectItem value="budget_premium">Budget premium</SelectItem>
                    <SelectItem value="budget_luxe">Budget luxe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="packOccasion">Occasion</Label>
                <Select
                  value={packFormData.occasion}
                  onValueChange={(value) => setPackFormData({ ...packFormData, occasion: value as PackOccasion })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saint_valentin">Saint-Valentin</SelectItem>
                    <SelectItem value="anniversaire">Anniversaire</SelectItem>
                    <SelectItem value="declaration">Déclaration</SelectItem>
                    <SelectItem value="reconciliation">Réconciliation</SelectItem>
                    <SelectItem value="cadeau_surprise">Cadeau surprise</SelectItem>
                    <SelectItem value="toutes_occasions">Toutes occasions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="packTheme">Thème</Label>
                <Select
                  value={packFormData.theme || ""}
                  onValueChange={(value) => setPackFormData({ ...packFormData, theme: value as PackTheme })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="romantique">Romantique</SelectItem>
                    <SelectItem value="gourmand">Gourmand</SelectItem>
                    <SelectItem value="luxe">Luxe</SelectItem>
                    <SelectItem value="classique">Classique</SelectItem>
                    <SelectItem value="moderne">Moderne</SelectItem>
                    <SelectItem value="personnalise">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packPrice">Prix du pack (FCFA)</Label>
                <Input
                  id="packPrice"
                  type="number"
                  value={packFormData.packPrice}
                  onChange={(e) => setPackFormData({ ...packFormData, packPrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packQuantity">Quantité disponible</Label>
                <Input
                  id="packQuantity"
                  type="number"
                  value={packFormData.availableQuantity}
                  onChange={(e) => setPackFormData({ ...packFormData, availableQuantity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="packTags">Tags (séparés par des virgules)</Label>
              <Input
                id="packTags"
                value={packFormData.tags}
                onChange={(e) => setPackFormData({ ...packFormData, tags: e.target.value })}
                placeholder="saint-valentin, cadeau, romantique"
              />
            </div>
            
            {/* Pack Items */}
            <div className="space-y-3 border-t pt-4">
              <Label>Produits du pack</Label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-8">
                  <Select
                    value={packItemForm.productId}
                    onValueChange={(value) => setPackItemForm({ ...packItemForm, productId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProducts.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.name} - {formatPrice(product.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="Qté"
                    value={packItemForm.quantity}
                    onChange={(e) => setPackItemForm({ ...packItemForm, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-1">
                  <Button onClick={addPackItem} className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Items List */}
              {packFormData.items.length > 0 && (
                <div className="space-y-2">
                  {packFormData.items.map((item, index) => {
                    const productId = typeof item.product === 'string' ? item.product : item.product._id;
                    return (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{getProductName(productId)}</p>
                          <p className="text-xs text-muted-foreground">
                            Quantité: {item.quantity} × {formatPrice(item.priceAtCreation)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePackItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Prix original total:</span>
                    <span className="font-bold">
                      {formatPrice(packFormData.items.reduce((sum, item) => sum + (item.priceAtCreation * item.quantity), 0))}
                    </span>
                  </div>
                  {packFormData.packPrice > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Économie:</span>
                      <span className="font-bold text-green-600">
                        {formatPrice(packFormData.items.reduce((sum, item) => sum + (item.priceAtCreation * item.quantity), 0) - packFormData.packPrice)}
                        {' '}
                        ({((1 - packFormData.packPrice / packFormData.items.reduce((sum, item) => sum + (item.priceAtCreation * item.quantity), 0)) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="packIsActive"
                  checked={packFormData.isActive}
                  onCheckedChange={(checked) => setPackFormData({ ...packFormData, isActive: checked })}
                />
                <Label htmlFor="packIsActive">Pack actif</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="packIsFeatured"
                  checked={packFormData.isFeatured}
                  onCheckedChange={(checked) => setPackFormData({ ...packFormData, isFeatured: checked })}
                />
                <Label htmlFor="packIsFeatured">Pack vedette</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreatePackDialogOpen(false);
              setIsEditPackDialogOpen(false);
              resetPackForm();
            }}>
              Annuler
            </Button>
            <Button onClick={isCreatePackDialogOpen ? handleCreatePack : handleUpdatePack}>
              {isCreatePackDialogOpen ? "Créer" : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pack Image Dialog */}
      <Dialog open={isPackImageDialogOpen} onOpenChange={setIsPackImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Télécharger une image - {selectedPack?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="packImage">Sélectionner une image</Label>
              <Input
                id="packImage"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageAlt">Texte alternatif</Label>
              <Input
                id="imageAlt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Description de l'image"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="packIsPrimary"
                checked={isPrimaryImage}
                onCheckedChange={setIsPrimaryImage}
              />
              <Label htmlFor="packIsPrimary">Image principale</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPackImageDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUploadPackImage} disabled={!selectedImage}>
              <Upload className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pack Details Dialog */}
      <Dialog open={isPackDetailsDialogOpen} onOpenChange={setIsPackDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPack?.name}</DialogTitle>
          </DialogHeader>
          {selectedPack && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedPack.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Prix</h4>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground line-through">
                      Prix original: {formatPrice(selectedPack.originalPrice)}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      Prix pack: {formatPrice(selectedPack.packPrice)}
                    </p>
                    <p className="text-sm text-green-600">
                      Économie: {formatPrice(selectedPack.discount)} ({selectedPack.discountPercentage.toFixed(0)}%)
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Informations</h4>
                  <div className="space-y-1 text-sm">
                    <p>Catégorie: <Badge variant="secondary">{selectedPack.category}</Badge></p>
                    <p>Occasion: <Badge variant="secondary">{selectedPack.occasion}</Badge></p>
                    {selectedPack.theme && (
                      <p>Thème: <Badge variant="secondary">{selectedPack.theme}</Badge></p>
                    )}
                    <p>Disponible: {selectedPack.availableQuantity} unités</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Produits inclus ({selectedPack.items.length})</h4>
                <div className="space-y-2">
                  {selectedPack.items.map((item, index) => {
                    const product = typeof item.product === 'string' ? 
                      allProducts.find(p => p._id === item.product) : 
                      item.product;
                    return (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">
                            {product?.name || 'Produit inconnu'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Quantité: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatPrice(item.priceAtCreation * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              {selectedPack.metadata && (
                <div>
                  <h4 className="font-semibold mb-2">Statistiques</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded p-2">
                      <p className="text-xs text-muted-foreground">Vues</p>
                      <p className="text-lg font-bold">{selectedPack.metadata.views}</p>
                    </div>
                    <div className="border rounded p-2">
                      <p className="text-xs text-muted-foreground">Achats</p>
                      <p className="text-lg font-bold">{selectedPack.metadata.purchases}</p>
                    </div>
                    <div className="border rounded p-2">
                      <p className="text-xs text-muted-foreground">Revenu</p>
                      <p className="text-lg font-bold">{formatPrice(selectedPack.metadata.revenue)}</p>
                    </div>
                    <div className="border rounded p-2">
                      <p className="text-xs text-muted-foreground">Note</p>
                      <p className="text-lg font-bold">{selectedPack.metadata.rating.toFixed(1)}/5</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Pack Confirmation Dialog */}
      <Dialog open={isDeletePackDialogOpen} onOpenChange={setIsDeletePackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{selectedPack?.name}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletePackDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeletePack}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pack Statistics Dialog */}
      <Dialog open={isPackStatsDialogOpen} onOpenChange={setIsPackStatsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Statistiques des Packs</DialogTitle>
          </DialogHeader>
          {packStatistics && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Packs</CardDescription>
                  <CardTitle className="text-3xl">{packStatistics.totalPacks || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Packs Actifs</CardDescription>
                  <CardTitle className="text-3xl">{packStatistics.activePacks || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Ventes Totales</CardDescription>
                  <CardTitle className="text-3xl">{packStatistics.totalSales || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Revenu Total</CardDescription>
                  <CardTitle className="text-2xl">{formatPrice(packStatistics.totalRevenue || 0)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Pack le plus vendu</CardDescription>
                  <CardTitle className="text-lg">{packStatistics.topPack?.name || 'N/A'}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Économies offertes</CardDescription>
                  <CardTitle className="text-2xl">{formatPrice(packStatistics.totalSavings || 0)}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
