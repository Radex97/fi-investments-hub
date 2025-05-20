
import { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import TopBar from "@/components/TopBar";
import MobileFooter from "@/components/MobileFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Transaction = {
  id: string;
  date: string;
  type: "buy" | "sell" | "dividend" | "interest" | "deposit" | "withdrawal";
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
};

const Transactions = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, currentMonth]);
  
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Transform the data to match our Transaction type
      const formattedTransactions = data.map((transaction: any) => ({
        id: transaction.id,
        date: transaction.created_at,
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        status: transaction.status,
      }));
      
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: t('error'),
        description: t('couldNotLoadTransactions'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'buy':
      case 'deposit':
        return <ArrowDown className="text-green-500" />;
      case 'sell':
      case 'withdrawal':
        return <ArrowUp className="text-red-500" />;
      case 'dividend':
      case 'interest':
        return <ArrowDown className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return t('completed');
      case 'pending':
        return t('pending');
      case 'failed':
        return t('failed');
      default:
        return '';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : (language === 'it' ? 'it-IT' : 'en-US'), { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <TopBar showBackButton={true} />
      
      <main className="pt-20 px-4 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('transactions')}</h1>
          <p className="text-neutral-600">{t('transactionsOverview')}</p>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <button className="px-2 py-1 border rounded-lg border-gray-300 flex items-center gap-1 text-sm">
            <span>{t('filter')}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              className="p-1 border rounded-lg border-gray-300"
              onClick={() => navigateMonth('prev')}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm">{formatMonthYear(currentMonth)}</span>
            <button 
              className="p-1 border rounded-lg border-gray-300"
              onClick={() => navigateMonth('next')}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fi-blue"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-neutral-600">{t('noTransactionsFound')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <p className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount >= 0 ? '+' : ''}
                    {transaction.amount.toLocaleString('de-DE', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </p>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getStatusText(transaction.status)}
                  </span>
                  <button className="text-xs text-fi-blue">{t('details')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Transactions;
