import React, { useState } from 'react';
import { StockIdentifier, PortfolioHolding, StockBasicData } from '../../types';
import SearchBar from '../search/SearchBar';
import { getStockBasicData } from '../../services/stockService';

interface AddStockFormProps {
    onAdd: (holding: PortfolioHolding) => void;
    onClose: () => void;
}

const AddStockForm: React.FC<AddStockFormProps> = ({ onAdd, onClose }) => {
    const [selectedStock, setSelectedStock] = useState<StockBasicData | null>(null);
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');
    const [isPriceLoading, setIsPriceLoading] = useState(false);

    const handleStockSelect = async (stock: StockIdentifier) => {
        setIsPriceLoading(true);
        setError('');
        setSelectedStock(null);
        try {
            const stockData = await getStockBasicData(stock.symbol);
            if (stockData) {
                setSelectedStock(stockData);
            } else {
                setError(`Could not fetch current price for ${stock.name}.`);
            }
        } catch (e) {
            setError(`Failed to fetch stock data for ${stock.name}.`);
        } finally {
            setIsPriceLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const qty = parseFloat(quantity);

        if (!selectedStock || !qty || qty <= 0) {
            setError('Please select a stock and enter a valid quantity.');
            return;
        }
        
        if (typeof selectedStock.currentPrice !== 'number') {
             setError('Could not determine the current price for the selected stock. Please try again.');
             return;
        }

        try {
            onAdd({
                symbol: selectedStock.symbol,
                name: selectedStock.name,
                quantity: qty,
                buyPrice: selectedStock.currentPrice,
                exchange: selectedStock.exchange,
            });
            onClose();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative border border-gray-700">
                 <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold text-sky-400 mb-6">Add Stock to Portfolio</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Search for Stock</label>
                        <SearchBar onStockSelect={handleStockSelect} />
                    </div>

                    {isPriceLoading && <p className="text-sm text-sky-400 animate-pulse">Fetching current price...</p>}
                    
                    {selectedStock && (
                        <div className="bg-gray-900/50 p-3 rounded-md text-sm border border-gray-700">
                            <p className="font-semibold text-gray-200">{selectedStock.name} ({selectedStock.symbol})</p>
                            <p className="text-gray-400">Current Price will be used as Buy Price: <span className="font-bold text-white">₹{selectedStock.currentPrice.toFixed(2)}</span></p>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                        <input 
                            type="number" 
                            id="quantity" 
                            value={quantity} 
                            onChange={e => setQuantity(e.target.value)} 
                            min="0" 
                            step="any" 
                            className="w-full p-2 bg-gray-700 text-gray-100 rounded-md border border-gray-600 focus:ring-sky-500 focus:border-sky-500" 
                            placeholder="e.g., 100" 
                            required
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-400 bg-red-900/20 p-2 rounded-md">{error}</p>}
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-colors" disabled={isPriceLoading || !selectedStock}>Add to Portfolio</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStockForm;