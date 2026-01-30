// import { Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// type TransactionType = "income" | "expense";

// const transactions = [
//   {
//     id: 1,
//     date: "09/02/2026",
//     description: "Commande Amina Sow",
//     type: "income" as TransactionType,
//     amount: "+40 000 FCFA",
//   },
//   {
//     id: 2,
//     date: "08/02/2026",
//     description: "Commande Jean Kouassi",
//     type: "income" as TransactionType,
//     amount: "+50 000 FCFA",
//   },
//   {
//     id: 3,
//     date: "05/02/2026",
//     description: "Publicité Facebook Ads",
//     type: "expense" as TransactionType,
//     amount: "-25 000 FCFA",
//   },
//   {
//     id: 4,
//     date: "01/02/2026",
//     description: "Sourcing Fleurs d'Afrique",
//     type: "expense" as TransactionType,
//     amount: "-150 000 FCFA",
//   },
//   {
//     id: 5,
//     date: "23/01/2026",
//     description: "Paiement CMD-2025-001",
//     type: "income" as TransactionType,
//     amount: "+50 000 FCFA",
//   },
// ];

// export default function Transactions() {
//   return (
//     <div className="space-y-6">
//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="bg-income rounded-xl p-6 text-white">
//           <p className="text-sm opacity-90 mb-1">Total Recettes</p>
//           <p className="text-3xl font-bold">140 000 FCFA</p>
//           <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
//             <div className="h-full w-[45%] bg-white rounded-full" />
//           </div>
//         </div>
//         <div className="bg-expense rounded-xl p-6 text-white">
//           <p className="text-sm opacity-90 mb-1">Total Dépenses</p>
//           <p className="text-3xl font-bold">175 000 FCFA</p>
//           <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
//             <div className="h-full w-[55%] bg-white rounded-full" />
//           </div>
//         </div>
//       </div>

//       {/* Transactions Table */}
//       <div className="bg-card rounded-xl border border-border shadow-card">
//         <div className="p-5 flex items-center justify-between border-b border-border">
//           <h2 className="font-semibold text-lg text-foreground font-sans">Journal des Transactions</h2>
//           <Button className="gap-2">
//             <Plus className="h-4 w-4" />
//             Ajouter Manuellement
//           </Button>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider bg-muted/30">
//                 <th className="px-5 py-3 font-medium">Date</th>
//                 <th className="px-5 py-3 font-medium">Description</th>
//                 <th className="px-5 py-3 font-medium">Type</th>
//                 <th className="px-5 py-3 font-medium text-right">Montant</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-border">
//               {transactions.map((tx) => (
//                 <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
//                   <td className="px-5 py-4 text-sm text-muted-foreground">{tx.date}</td>
//                   <td className="px-5 py-4 text-sm font-medium text-foreground">{tx.description}</td>
//                   <td className="px-5 py-4">
//                     <span className={cn(
//                       "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase",
//                       tx.type === "income" 
//                         ? "bg-income-bg text-income" 
//                         : "bg-expense-bg text-expense"
//                     )}>
//                       {tx.type === "income" ? "Entrée" : "Sortie"}
//                     </span>
//                   </td>
//                   <td className={cn(
//                     "px-5 py-4 text-sm font-semibold text-right",
//                     tx.type === "income" ? "text-income" : "text-expense"
//                   )}>
//                     {tx.amount}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Loader2,
  Search,
  Filter,
  Calendar,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  DollarSign,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { transactionService } from "@/services/transaction.service";
import {
  Transaction,
  TransactionCategory,
  PaymentMethod,
  TransactionAccount,
} from "@/types/api.types";
import { useToast } from "@/hooks/use-toast";

interface TransactionFormData {
  type: "income" | "expense";
  category: TransactionCategory;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  account: TransactionAccount;
  date: string;
  notes?: string;
}

const initialFormData: TransactionFormData = {
  type: "income",
  category: "sales",
  amount: 0,
  description: "",
  paymentMethod: "cash",
  account: "main_cash",
  date: new Date().toISOString().split("T")[0],
  notes: "",
};

const incomeCategories: { value: TransactionCategory; label: string }[] = [
  { value: "sales", label: "Ventes" },
  { value: "refund_received", label: "Remboursement reçu" },
  { value: "other_income", label: "Autre revenu" },
];

const expenseCategories: { value: TransactionCategory; label: string }[] = [
  { value: "sourcing", label: "Approvisionnement" },
  { value: "delivery", label: "Livraison" },
  { value: "marketing", label: "Marketing" },
  { value: "packaging", label: "Emballage" },
  { value: "rent", label: "Loyer" },
  { value: "utilities", label: "Utilities" },
  { value: "salaries", label: "Salaires" },
  { value: "refund_given", label: "Remboursement émis" },
  { value: "other_expense", label: "Autre dépense" },
];

const paymentMethods: { value: PaymentMethod; label: string; icon: any }[] = [
  { value: "cash", label: "Espèces", icon: Wallet },
  { value: "momo", label: "Mobile Money", icon: Smartphone },
  { value: "bank_transfer", label: "Virement", icon: Banknote },
  { value: "card", label: "Carte", icon: CreditCard },
  { value: "credit", label: "Crédit", icon: DollarSign },
];

const accounts: { value: TransactionAccount; label: string }[] = [
  { value: "main_cash", label: "Caisse Principale" },
  { value: "momo_account", label: "Mobile Money" },
  { value: "bank_account", label: "Compte Bancaire" },
  { value: "card_terminal", label: "Terminal CB" },
];

export default function Transactions() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>(initialFormData);
  
  // Dashboard stats
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomePercentage: 0,
    expensePercentage: 0,
  });

  // Filters
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | "all">("all");
  const [accountFilter, setAccountFilter] = useState<TransactionAccount | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (typeFilter !== "all") params.type = typeFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (accountFilter !== "all") params.account = accountFilter;
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const response = await transactionService.getTransactions(params);

      if (response.success && response.data) {
        let filtered = response.data;

        // Client-side search
        if (searchQuery) {
          filtered = filtered.filter(
            (t) =>
              t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.transactionNumber.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setTransactions(filtered);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [typeFilter, categoryFilter, accountFilter, searchQuery, dateRange, toast]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const params: any = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const response = await transactionService.getFinancialDashboard(
        params.startDate,
        params.endDate
      );

      if (response.success && response.data) {
        const data = response.data;
        const totalIncome = data.totalIncome || 0;
        const totalExpense = data.totalExpense || 0;
        const total = totalIncome + totalExpense;

        setDashboardData({
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          incomePercentage: total > 0 ? (totalIncome / total) * 100 : 0,
          expensePercentage: total > 0 ? (totalExpense / total) * 100 : 0,
        });
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchTransactions();
    fetchDashboardData();
  }, [fetchTransactions, fetchDashboardData]);

  // Create transaction
  const handleCreateTransaction = async () => {
    if (!formData.description || formData.amount <= 0) {
      toast({
        title: "Validation",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await transactionService.createTransaction({
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        account: formData.account,
        date: new Date(formData.date),
        notes: formData.notes,
      });

      if (response.success) {
        toast({
          title: "Succès",
          description: "Transaction créée avec succès",
        });
        setIsCreateDialogOpen(false);
        setFormData(initialFormData);
        fetchTransactions();
        fetchDashboardData();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la transaction",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Update transaction
  const handleUpdateTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      setSubmitting(true);

      const response = await transactionService.updateTransaction(
        selectedTransaction._id,
        {
          type: formData.type,
          category: formData.category,
          amount: formData.amount,
          description: formData.description,
          paymentMethod: formData.paymentMethod,
          account: formData.account,
          date: new Date(formData.date),
          notes: formData.notes,
        }
      );

      if (response.success) {
        toast({
          title: "Succès",
          description: "Transaction mise à jour",
        });
        setIsEditDialogOpen(false);
        setSelectedTransaction(null);
        fetchTransactions();
        fetchDashboardData();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la transaction",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) return;

    try {
      const response = await transactionService.deleteTransaction(id);

      if (response.success) {
        toast({
          title: "Succès",
          description: "Transaction supprimée",
        });
        fetchTransactions();
        fetchDashboardData();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la transaction",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      paymentMethod: transaction.paymentMethod,
      account: transaction.account,
      date: new Date(transaction.date).toISOString().split("T")[0],
      notes: transaction.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  // Get category label
  const getCategoryLabel = (category: TransactionCategory) => {
    const allCategories = [...incomeCategories, ...expenseCategories];
    return allCategories.find((c) => c.value === category)?.label || category;
  };

  // Get payment method icon and label
  const getPaymentMethodInfo = (method: PaymentMethod) => {
    return paymentMethods.find((pm) => pm.value === method);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos revenus et dépenses
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle Transaction</DialogTitle>
              <DialogDescription>Ajouter une transaction manuelle</DialogDescription>
            </DialogHeader>

            <TransactionForm
              formData={formData}
              setFormData={setFormData}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              paymentMethods={paymentMethods}
              accounts={accounts}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateTransaction} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-income rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Total Recettes</p>
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold mb-3">
            {formatCurrency(dashboardData.totalIncome)}
          </p>
          <div className="h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${dashboardData.incomePercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-expense rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Total Dépenses</p>
            <TrendingDown className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold mb-3">
            {formatCurrency(dashboardData.totalExpense)}
          </p>
          <div className="h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${dashboardData.expensePercentage}%` }}
            />
          </div>
        </div>

        <div
          className={cn(
            "rounded-xl p-6 text-white",
            dashboardData.balance >= 0 ? "bg-status-success" : "bg-status-error"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Solde</p>
            <DollarSign className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold mb-3">
            {formatCurrency(Math.abs(dashboardData.balance))}
          </p>
          <p className="text-xs opacity-75">
            {dashboardData.balance >= 0 ? "Bénéfice" : "Déficit"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Select
          value={typeFilter}
          onValueChange={(value: any) => setTypeFilter(value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            <SelectItem value="income">Recettes</SelectItem>
            <SelectItem value="expense">Dépenses</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(value: any) => setCategoryFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {incomeCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
            {expenseCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={accountFilter}
          onValueChange={(value: any) => setAccountFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous comptes</SelectItem>
            {accounts.map((acc) => (
              <SelectItem key={acc.value} value={acc.value}>
                {acc.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
          className="w-[160px]"
        />
        <Input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
          className="w-[160px]"
        />

        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">Aucune transaction</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Commencez par ajouter votre première transaction
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Transaction
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider bg-muted/30">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">N° Transaction</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Catégorie</th>
                  <th className="px-5 py-3 font-medium">Paiement</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium text-right">Montant</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => {
                  const paymentInfo = getPaymentMethodInfo(tx.paymentMethod);
                  const PaymentIcon = paymentInfo?.icon || Wallet;

                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-5 py-4 text-sm font-mono text-muted-foreground">
                        {tx.transactionNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {tx.description}
                          </p>
                          {tx.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {tx.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {getCategoryLabel(tx.category)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <PaymentIcon className="h-4 w-4" />
                          <span>{paymentInfo?.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase",
                            tx.type === "income"
                              ? "bg-income-bg text-income"
                              : "bg-expense-bg text-expense"
                          )}
                        >
                          {tx.type === "income" ? "Entrée" : "Sortie"}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "px-5 py-4 text-sm font-semibold text-right",
                          tx.type === "income" ? "text-income" : "text-expense"
                        )}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(tx)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTransaction(tx._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {selectedTransaction && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier Transaction</DialogTitle>
              <DialogDescription>
                {selectedTransaction.transactionNumber}
              </DialogDescription>
            </DialogHeader>

            <TransactionForm
              formData={formData}
              setFormData={setFormData}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              paymentMethods={paymentMethods}
              accounts={accounts}
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedTransaction(null);
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdateTransaction} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mettre à jour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Transaction Form Component
interface TransactionFormProps {
  formData: TransactionFormData;
  setFormData: React.Dispatch<React.SetStateAction<TransactionFormData>>;
  incomeCategories: { value: TransactionCategory; label: string }[];
  expenseCategories: { value: TransactionCategory; label: string }[];
  paymentMethods: { value: PaymentMethod; label: string; icon: any }[];
  accounts: { value: TransactionAccount; label: string }[];
}

export function TransactionForm({
  formData,
  setFormData,
  incomeCategories,
  expenseCategories,
  paymentMethods,
  accounts,
}: TransactionFormProps) {
  const categories =
    formData.type === "income" ? incomeCategories : expenseCategories;

  return (
    <div className="space-y-6 py-4">
      {/* Type */}
      <div className="space-y-2">
        <Label>Type de transaction *</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, type: "income", category: "sales" }))
            }
            className={cn(
              "p-4 rounded-lg border-2 transition-all text-center",
              formData.type === "income"
                ? "border-income bg-income/10"
                : "border-border hover:border-income/50"
            )}
          >
            <TrendingUp
              className={cn(
                "h-6 w-6 mx-auto mb-2",
                formData.type === "income" ? "text-income" : "text-muted-foreground"
              )}
            />
            <p className="font-medium">Recette</p>
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                type: "expense",
                category: "sourcing",
              }))
            }
            className={cn(
              "p-4 rounded-lg border-2 transition-all text-center",
              formData.type === "expense"
                ? "border-expense bg-expense/10"
                : "border-border hover:border-expense/50"
            )}
          >
            <TrendingDown
              className={cn(
                "h-6 w-6 mx-auto mb-2",
                formData.type === "expense" ? "text-expense" : "text-muted-foreground"
              )}
            />
            <p className="font-medium">Dépense</p>
          </button>
        </div>
      </div>

      {/* Description and Amount */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            placeholder="Ex: Vente commande #123"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Montant (FCFA) *</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0"
            value={formData.amount || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))
            }
          />
        </div>
      </div>

      {/* Category and Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie *</Label>
          <Select
            value={formData.category}
            onValueChange={(value: TransactionCategory) =>
              setFormData((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Payment Method and Account */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Mode de paiement *</Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={(value: PaymentMethod) =>
              setFormData((prev) => ({ ...prev, paymentMethod: value }))
            }
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((pm) => (
                <SelectItem key={pm.value} value={pm.value}>
                  {pm.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="account">Compte *</Label>
          <Select
            value={formData.account}
            onValueChange={(value: TransactionAccount) =>
              setFormData((prev) => ({ ...prev, account: value }))
            }
          >
            <SelectTrigger id="account">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.value} value={acc.value}>
                  {acc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Notes additionnelles..."
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          rows={3}
        />
      </div>
    </div>
  );
}