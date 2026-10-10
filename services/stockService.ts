import { StockIdentifier, StockBasicData, StockFundamentalData, NewsItemRaw, CorporateAnnouncement, FinancialMetric, PriceDataPoint, ChartInterval, ScreenerCriteria } from '../types';
import { MOCK_API_DELAY } from '../constants';

const mockStocks: StockIdentifier[] = [
  // Original Stocks
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', exchange: 'NSE' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', exchange: 'NSE' },
  { symbol: 'INFY', name: 'Infosys Ltd.', exchange: 'NSE' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', exchange: 'NSE' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', exchange: 'NSE' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', exchange: 'NSE' },
  { symbol: 'ITC', name: 'ITC Ltd.', exchange: 'NSE' },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', exchange: 'NSE' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', exchange: 'NSE' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', exchange: 'NSE' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', exchange: 'NSE' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', exchange: 'NSE' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', exchange: 'NSE' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', exchange: 'NSE' },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', exchange: 'NSE' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', exchange: 'NSE' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd.', exchange: 'NSE' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', exchange: 'NSE' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', exchange: 'NSE' },
  { symbol: 'DMART', name: 'Avenue Supermarts Ltd.', exchange: 'NSE' },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd.', exchange: 'NSE' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', exchange: 'NSE' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', exchange: 'NSE' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', exchange: 'NSE' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', exchange: 'NSE' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', exchange: 'NSE' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', exchange: 'NSE' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', exchange: 'NSE' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd.', exchange: 'NSE' },
  { symbol: 'NTPC', name: 'NTPC Ltd.', exchange: 'NSE' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd.', exchange: 'NSE' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.', exchange: 'NSE' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd.', exchange: 'NSE' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd.', exchange: 'NSE' },
  { symbol: 'CIPLA', name: 'Cipla Ltd.', exchange: 'NSE' },
  { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories Ltd.', exchange: 'NSE' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd.', exchange: 'NSE' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd.', exchange: 'NSE' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', exchange: 'NSE' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', exchange: 'NSE' },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd.', exchange: 'NSE' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', exchange: 'NSE' },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd.', exchange: 'NSE' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd.', exchange: 'NSE' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd.', exchange: 'NSE' },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd.', exchange: 'NSE' },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd.', exchange: 'NSE' },
  { symbol: 'ADANIPOWER', name: 'Adani Power Ltd.', exchange: 'NSE' },
  { symbol: 'TATAPOWER', name: 'Tata Power Company Ltd.', exchange: 'NSE' },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd.', exchange: 'NSE' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd.', exchange: 'NSE' },
  { symbol: 'PAYTM', name: 'One97 Communications Ltd. (Paytm)', exchange: 'NSE' },
  { symbol: 'POLICYBZR', name: 'PB Fintech Ltd. (Policybazaar)', exchange: 'NSE' },
  { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures Ltd. (Nykaa)', exchange: 'NSE' },
  { symbol: 'IRCTC', name: 'Indian Railway Catering & Tourism Corp Ltd.', exchange: 'NSE' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd.', exchange: 'NSE' },
  { symbol: 'IOC', name: 'Indian Oil Corporation Ltd.', exchange: 'NSE' },
  { symbol: 'RECLTD', name: 'REC Ltd.', exchange: 'NSE' },
  { symbol: 'PFC', name: 'Power Finance Corporation Ltd.', exchange: 'NSE' },
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', exchange: 'NSE' },
  { symbol: 'PNB', name: 'Punjab National Bank', exchange: 'NSE' },
  { symbol: 'SAIL', name: 'Steel Authority of India Ltd.', exchange: 'NSE' },
  { symbol: 'GAIL', name: 'GAIL (India) Ltd.', exchange: 'NSE' },
  { symbol: 'DLF', name: 'DLF Ltd.', exchange: 'NSE' },
  { symbol: 'SIEMENS', name: 'Siemens Ltd.', exchange: 'NSE' },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd.', exchange: 'NSE' },
  { symbol: 'DABUR', name: 'Dabur India Ltd.', exchange: 'NSE' },
  { symbol: 'MARICO', name: 'Marico Ltd.', exchange: 'NSE' },
  { symbol: 'UPL', name: 'UPL Ltd.', exchange: 'NSE' },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd.', exchange: 'NSE' },
  { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd.', exchange: 'NSE' },
  { symbol: 'ACC', name: 'ACC Ltd.', exchange: 'NSE' },
  { symbol: 'HAVELLS', name: 'Havells India Ltd.', exchange: 'NSE' },
  { symbol: 'ICICIPRULI', name: 'ICICI Prudential Life Insurance Company Ltd.', exchange: 'NSE' },
  { symbol: 'ICICIGI', name: 'ICICI Lombard General Insurance Company Ltd.', exchange: 'NSE' },
  { symbol: 'HDFCAMC', name: 'HDFC Asset Management Company Ltd.', exchange: 'NSE' },
  { symbol: 'VEDL', name: 'Vedanta Ltd.', exchange: 'NSE' },
  { symbol: 'INDIGO', name: 'InterGlobe Aviation Ltd.', exchange: 'NSE' },
  { symbol: 'BOSCHLTD', name: 'Bosch Ltd.', exchange: 'NSE' },
  { symbol: 'LUPIN', name: 'Lupin Ltd.', exchange: 'NSE' },
  { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma Ltd.', exchange: 'NSE' },
  { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories Ltd.', exchange: 'NSE' },
  { symbol: 'BANDHANBNK', name: 'Bandhan Bank Ltd.', exchange: 'NSE' },
  { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd.', exchange: 'NSE' },
  { symbol: 'MRF', name: 'MRF Ltd.', exchange: 'NSE' },
  { symbol: 'MOTHERSON', name: 'Samvardhana Motherson International Ltd.', exchange: 'NSE' },
  { symbol: 'BERGEPAINT', name: 'Berger Paints India Ltd.', exchange: 'NSE' },
  { symbol: 'CHOLAFIN', name: 'Cholamandalam Investment and Finance Company Ltd.', exchange: 'NSE' },
  { symbol: 'SRF', name: 'SRF Ltd.', exchange: 'NSE' },
  { symbol: 'TRENT', name: 'Trent Ltd.', exchange: 'NSE' },
  { symbol: 'JUBLFOOD', name: 'Jubilant FoodWorks Ltd.', exchange: 'NSE' },
  { symbol: 'PIIND', name: 'PI Industries Ltd.', exchange: 'NSE' },
  // Newly Added Stocks (Post-request)
  { symbol: 'KALAMANDIR', name: 'Sai Silks (Kalamandir) Ltd.', exchange: 'NSE' },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd.', exchange: 'NSE' },
  { symbol: 'RVNL', name: 'Rail Vikas Nigam Ltd.', exchange: 'NSE' },
  { symbol: 'IRFC', name: 'Indian Railway Finance Corporation Ltd.', exchange: 'NSE' },
  { symbol: 'MAZDOCK', name: 'Mazagon Dock Shipbuilders Ltd.', exchange: 'NSE' },
  { symbol: 'DATAPATTNS', name: 'Data Patterns (India) Ltd.', exchange: 'NSE' },
  { symbol: 'NAZARA', name: 'Nazara Technologies Ltd.', exchange: 'NSE' },
  { symbol: 'MANYAVAR', name: 'Vedant Fashions Ltd.', exchange: 'NSE' },
  { symbol: 'IEX', name: 'Indian Energy Exchange Ltd.', exchange: 'NSE' },
  { symbol: 'CDSL', name: 'Central Depository Services (India) Ltd.', exchange: 'NSE' },
  { symbol: 'BHEL', name: 'Bharat Heavy Electricals Ltd.', exchange: 'NSE' },
  { symbol: 'BEL', name: 'Bharat Electronics Ltd.', exchange: 'NSE' },
  { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite Ltd.', exchange: 'NSE' },
  { symbol: 'AARTINDS', name: 'Aarti Industries Ltd.', exchange: 'NSE' },
  { symbol: 'DEVYANI', name: 'Devyani International Ltd.', exchange: 'NSE' },
  { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd.', exchange: 'NSE' },
  { symbol: 'TATATECH', name: 'Tata Technologies Ltd.', exchange: 'NSE' },
  { symbol: 'IREDA', name: 'Indian Renewable Energy Development Agency Ltd.', exchange: 'NSE' },
  { symbol: 'HUDCO', name: 'Housing & Urban Development Corporation Ltd.', exchange: 'NSE' },
  { symbol: 'JIOFIN', name: 'Jio Financial Services Ltd.', exchange: 'NSE' },
  { symbol: 'LICHSGFIN', name: 'LIC Housing Finance Ltd.', exchange: 'NSE' },
  { symbol: 'UNIONBANK', name: 'Union Bank of India', exchange: 'NSE' },
  { symbol: 'CANBK', name: 'Canara Bank', exchange: 'NSE' },
  { symbol: 'INDIANB', name: 'Indian Bank', exchange: 'NSE' },
  { symbol: 'FEDERALBNK', name: 'The Federal Bank Ltd.', exchange: 'NSE' },
  { symbol: 'AUBANK', name: 'AU Small Finance Bank Ltd.', exchange: 'NSE' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd.', exchange: 'NSE' },
  { symbol: 'MAXHEALTH', name: 'Max Healthcare Institute Ltd.', exchange: 'NSE' },
  { symbol: 'FORTIS', name: 'Fortis Healthcare Ltd.', exchange: 'NSE' },
  { symbol: 'GLAND', name: 'Gland Pharma Ltd.', exchange: 'NSE' },
  { symbol: 'ALKEM', name: 'Alkem Laboratories Ltd.', exchange: 'NSE' },
  { symbol: 'TVSMOTOR', name: 'TVS Motor Company Ltd.', exchange: 'NSE' },
  { symbol: 'ASHOKLEY', name: 'Ashok Leyland Ltd.', exchange: 'NSE' },
  { symbol: 'APOLLOTYRE', name: 'Apollo Tyres Ltd.', exchange: 'NSE' },
  { symbol: 'BALKRISIND', name: 'Balkrishna Industries Ltd.', exchange: 'NSE' },
  { symbol: 'VOLTAS', name: 'Voltas Ltd.', exchange: 'NSE' },
  { symbol: 'DIXON', name: 'Dixon Technologies (India) Ltd.', exchange: 'NSE' },
  { symbol: 'POLYCAB', name: 'Polycab India Ltd.', exchange: 'NSE' },
  { symbol: 'KAJARIACER', name: 'Kajaria Ceramics Ltd.', exchange: 'NSE' },
  { symbol: 'LODHA', name: 'Macrotech Developers Ltd.', exchange: 'NSE' },
  { symbol: 'GODREJPROP', name: 'Godrej Properties Ltd.', exchange: 'NSE' },
  { symbol: 'OBEROIRLTY', name: 'Oberoi Realty Ltd.', exchange: 'NSE' },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd.', exchange: 'NSE' },
  { symbol: 'COFORGE', name: 'Coforge Ltd.', exchange: 'NSE' },
  { symbol: 'MPHASIS', name: 'MphasiS Ltd.', exchange: 'NSE' },
  { symbol: 'LTTS', name: 'L&T Technology Services Ltd.', exchange: 'NSE' },
  { symbol: 'OFSS', name: 'Oracle Financial Services Software Ltd.', exchange: 'NSE' },
  { symbol: 'PAGEIND', name: 'Page Industries Ltd.', exchange: 'NSE' },
  
  // BSE Variants
  { symbol: '500325', name: 'Reliance Industries Ltd.', exchange: 'BSE' },
  { symbol: '532540', name: 'Tata Consultancy Services Ltd.', exchange: 'BSE' },
  { symbol: '500209', name: 'Infosys Ltd.', exchange: 'BSE' },
  { symbol: '500180', name: 'HDFC Bank Ltd.', exchange: 'BSE' },
  { symbol: '532174', name: 'ICICI Bank Ltd.', exchange: 'BSE' },
  { symbol: '500696', name: 'Hindustan Unilever Ltd.', exchange: 'BSE' },
  { symbol: '500875', name: 'ITC Ltd.', exchange: 'BSE' },
  { symbol: '500112', name: 'State Bank of India', exchange: 'BSE' },
  { symbol: '500034', name: 'Bajaj Finance Ltd.', exchange: 'BSE' },
  { symbol: '500247', name: 'Kotak Mahindra Bank Ltd.', exchange: 'BSE' },
  { symbol: '532454', name: 'Bharti Airtel Ltd.', exchange: 'BSE' },
  { symbol: '500510', name: 'Larsen & Toubro Ltd.', exchange: 'BSE' },
  { symbol: '532500', name: 'Maruti Suzuki India Ltd.', exchange: 'BSE' },
  { symbol: '500820', name: 'Asian Paints Ltd.', exchange: 'BSE' },
  { symbol: '532215', name: 'Axis Bank Ltd.', exchange: 'BSE' },
  { symbol: '500114', name: 'Titan Company Ltd.', exchange: 'BSE' },
  { symbol: '507685', name: 'Wipro Ltd.', exchange: 'BSE' },
  { symbol: '500790', name: 'Nestle India Ltd.', exchange: 'BSE' },
  { symbol: '524715', name: 'Sun Pharmaceutical Industries Ltd.', exchange: 'BSE' },
  { symbol: '512599', name: 'Adani Enterprises Ltd.', exchange: 'BSE' },
  { symbol: '540376', name: 'Avenue Supermarts Ltd.', exchange: 'BSE' },
  { symbol: '500331', name: 'Pidilite Industries Ltd.', exchange: 'BSE' },
  { symbol: '532538', name: 'UltraTech Cement Ltd.', exchange: 'BSE' },
  { symbol: '543960', name: 'Sai Silks (Kalamandir) Ltd.', exchange: 'BSE' },
  { symbol: '541154', name: 'Hindustan Aeronautics Ltd.', exchange: 'BSE' },
  { symbol: '542649', name: 'Data Patterns (India) Ltd.', exchange: 'BSE' },
  { symbol: '543287', name: 'Nazara Technologies Ltd.', exchange: 'BSE' },
  { symbol: '541725', name: 'Indian Energy Exchange Ltd.', exchange: 'BSE' },
  { symbol: '532894', name: 'Central Depository Services (India) Ltd.', exchange: 'BSE' },
  { symbol: '500103', name: 'Bharat Heavy Electricals Ltd.', exchange: 'BSE' },
  { symbol: '500049', name: 'Bharat Electronics Ltd.', exchange: 'BSE' },
  { symbol: '543534', name: 'Devyani International Ltd.', exchange: 'BSE' },
  { symbol: '543536', name: 'Tata Technologies Ltd.', exchange: 'BSE' },
  { symbol: '544026', name: 'Indian Renewable Energy Development Agency Ltd.', exchange: 'BSE' },
  { symbol: '543944', name: 'Jio Financial Services Ltd.', exchange: 'BSE' },
];

const mockStockDetails: { [key: string]: Omit<StockBasicData, 'change' | 'changePercent'> } = {
  // Original
  RELIANCE: {
    symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', exchange: 'NSE', sector: 'Oil & Gas', currentPrice: 2850.00,
    open: 2830.00, high: 2865.00, low: 2825.00, close: 2845.00, volume: 5500000,
    fiftyTwoWeekHigh: 3000.00, fiftyTwoWeekLow: 2200.00, marketCap: "₹19,20,000 Cr",
    peRatio: 28.5, pbRatio: 3.5, dividendYield: 0.35, debtToEquity: 0.4, roe: 12.5,
    promoterHolding: 50.3, promoterPledged: 0.5,
  },
  INFY: {
    symbol: 'INFY', name: 'Infosys Ltd.', exchange: 'NSE', sector: 'IT Services & Consulting', currentPrice: 1550.75,
    open: 1540.00, high: 1560.00, low: 1535.00, close: 1538.50, volume: 6200000,
    fiftyTwoWeekHigh: 1750.00, fiftyTwoWeekLow: 1250.00, marketCap: "₹6,50,000 Cr",
    peRatio: 25.2, pbRatio: 7.1, dividendYield: 2.1, debtToEquity: 0.1, roe: 28.9,
    promoterHolding: 15.1, promoterPledged: 0,
  },
  TCS: {
    symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', exchange: 'NSE', sector: 'IT Services & Consulting', currentPrice: 3800.50,
    open: 3790.00, high: 3820.00, low: 3780.00, close: 3785.00, volume: 4000000,
    fiftyTwoWeekHigh: 4000.00, fiftyTwoWeekLow: 3000.00, marketCap: "₹14,00,000 Cr",
    peRatio: 30.0, pbRatio: 12.0, dividendYield: 1.2, debtToEquity: 0.05, roe: 45.0,
    promoterHolding: 72.3, promoterPledged: 0.1,
  },
  HDFCBANK: {
    symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', exchange: 'NSE', sector: 'Banking - Private', currentPrice: 1450.20,
    open: 1445.00, high: 1460.00, low: 1440.00, close: 1442.00, volume: 12000000,
    fiftyTwoWeekHigh: 1750.00, fiftyTwoWeekLow: 1300.00, marketCap: "₹11,00,000 Cr",
    peRatio: 18.0, pbRatio: 3.0, dividendYield: 1.1, debtToEquity: 0, roe: 17.0, // Banks D/E is different
    promoterHolding: 0, promoterPledged: 0, // No identifiable promoter
  },
  ICICIBANK: {
    symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', exchange: 'NSE', sector: 'Banking - Private', currentPrice: 1050.80,
    open: 1045.00, high: 1055.00, low: 1040.00, close: 1048.00, volume: 15000000,
    fiftyTwoWeekHigh: 1150.00, fiftyTwoWeekLow: 800.00, marketCap: "₹7,50,000 Cr",
    peRatio: 17.5, pbRatio: 3.2, dividendYield: 0.7, debtToEquity: 0, roe: 16.5,
    promoterHolding: 0, promoterPledged: 0,
  },
  HINDUNILVR: {
    symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', exchange: 'NSE', sector: 'FMCG', currentPrice: 2380.00,
    open: 2370.00, high: 2390.00, low: 2365.00, close: 2375.00, volume: 2000000,
    fiftyTwoWeekHigh: 2800.00, fiftyTwoWeekLow: 2200.00, marketCap: "₹5,60,000 Cr",
    peRatio: 55.0, pbRatio: 11.0, dividendYield: 1.5, debtToEquity: 0.02, roe: 20.0,
    promoterHolding: 61.9, promoterPledged: 0,
  },
  ITC: {
    symbol: 'ITC', name: 'ITC Ltd.', exchange: 'NSE', sector: 'FMCG', currentPrice: 430.00,
    open: 428.00, high: 435.00, low: 427.00, close: 429.00, volume: 10000000,
    fiftyTwoWeekHigh: 500.00, fiftyTwoWeekLow: 350.00, marketCap: "₹5,30,000 Cr",
    peRatio: 25.0, pbRatio: 7.0, dividendYield: 3.0, debtToEquity: 0.01, roe: 28.0,
    promoterHolding: 0, promoterPledged: 0,
  },
  SBIN: {
    symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking - PSU', currentPrice: 750.00,
    open: 745.00, high: 755.00, low: 740.00, close: 748.00, volume: 18000000,
    fiftyTwoWeekHigh: 800.00, fiftyTwoWeekLow: 500.00, marketCap: "₹6,70,000 Cr",
    peRatio: 10.0, pbRatio: 1.8, dividendYield: 1.5, debtToEquity: 0, roe: 15.0,
    promoterHolding: 57.5, promoterPledged: 0,
  },
  BAJFINANCE: {
    symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', exchange: 'NSE', sector: 'Financial Services - NBFC', currentPrice: 7200.00,
    open: 7180.00, high: 7250.00, low: 7150.00, close: 7190.00, volume: 1000000,
    fiftyTwoWeekHigh: 8200.00, fiftyTwoWeekLow: 6000.00, marketCap: "₹4,50,000 Cr",
    peRatio: 35.0, pbRatio: 7.5, dividendYield: 0.4, debtToEquity: 3.5, roe: 22.0,
    promoterHolding: 54.8, promoterPledged: 0,
  },
  KOTAKBANK: {
    symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', exchange: 'NSE', sector: 'Banking - Private', currentPrice: 1750.00,
    open: 1740.00, high: 1760.00, low: 1735.00, close: 1745.00, volume: 3000000,
    fiftyTwoWeekHigh: 2000.00, fiftyTwoWeekLow: 1600.00, marketCap: "₹3,50,000 Cr",
    peRatio: 20.0, pbRatio: 3.0, dividendYield: 0.1, debtToEquity: 0, roe: 14.0,
    promoterHolding: 25.9, promoterPledged: 0,
  },
  BHARTIARTL: {
    symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', exchange: 'NSE', sector: 'Telecom', currentPrice: 1200.00,
    open: 1190.00, high: 1210.00, low: 1185.00, close: 1195.00, volume: 7000000,
    fiftyTwoWeekHigh: 1300.00, fiftyTwoWeekLow: 750.00, marketCap: "₹6,80,000 Cr",
    peRatio: 60.0, pbRatio: 6.0, dividendYield: 0.2, debtToEquity: 2.5, roe: 10.0,
    promoterHolding: 54.0, promoterPledged: 1.2,
  },
  LT: {
    symbol: 'LT', name: 'Larsen & Toubro Ltd.', exchange: 'NSE', sector: 'Infrastructure', currentPrice: 3500.00,
    open: 3480.00, high: 3520.00, low: 3470.00, close: 3490.00, volume: 1500000,
    fiftyTwoWeekHigh: 3800.00, fiftyTwoWeekLow: 2000.00, marketCap: "₹4,80,000 Cr",
    peRatio: 30.0, pbRatio: 5.0, dividendYield: 0.7, debtToEquity: 1.8, roe: 15.0,
    promoterHolding: 0, promoterPledged: 0,
  },
   MARUTI: {
    symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', exchange: 'NSE', sector: 'Automobile', currentPrice: 11500.00,
    open: 11450.00, high: 11550.00, low: 11400.00, close: 11480.00, volume: 500000,
    fiftyTwoWeekHigh: 12000.00, fiftyTwoWeekLow: 8000.00, marketCap: "₹3,60,000 Cr",
    peRatio: 30.0, pbRatio: 4.5, dividendYield: 0.8, debtToEquity: 0.01, roe: 15.0,
    promoterHolding: 56.4, promoterPledged: 0,
  },
  ASIANPAINT: {
    symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', exchange: 'NSE', sector: 'Paints', currentPrice: 2850.00,
    open: 2840.00, high: 2860.00, low: 2830.00, close: 2845.00, volume: 800000,
    fiftyTwoWeekHigh: 3500.00, fiftyTwoWeekLow: 2500.00, marketCap: "₹2,70,000 Cr",
    peRatio: 50.0, pbRatio: 12.0, dividendYield: 0.8, debtToEquity: 0.1, roe: 25.0,
    promoterHolding: 52.6, promoterPledged: 2.1,
  },
  AXISBANK: {
    symbol: 'AXISBANK', name: 'Axis Bank Ltd.', exchange: 'NSE', sector: 'Banking - Private', currentPrice: 1080.00,
    open: 1075.00, high: 1085.00, low: 1070.00, close: 1078.00, volume: 9000000,
    fiftyTwoWeekHigh: 1150.00, fiftyTwoWeekLow: 800.00, marketCap: "₹3,30,000 Cr",
    peRatio: 15.0, pbRatio: 2.0, dividendYield: 0.1, debtToEquity: 0, roe: 13.0,
    promoterHolding: 8.3, promoterPledged: 0,
  },
  TITAN: {
    symbol: 'TITAN', name: 'Titan Company Ltd.', exchange: 'NSE', sector: 'Retail', currentPrice: 3550.00,
    open: 3540.00, high: 3570.00, low: 3530.00, close: 3545.00, volume: 700000,
    fiftyTwoWeekHigh: 3800.00, fiftyTwoWeekLow: 2500.00, marketCap: "₹3,15,000 Cr",
    peRatio: 85.0, pbRatio: 20.0, dividendYield: 0.3, debtToEquity: 0.7, roe: 24.0,
    promoterHolding: 52.9, promoterPledged: 0,
  },
  WIPRO: {
    symbol: 'WIPRO', name: 'Wipro Ltd.', exchange: 'NSE', sector: 'IT Services & Consulting', currentPrice: 480.00,
    open: 478.00, high: 482.00, low: 477.00, close: 479.00, volume: 5000000,
    fiftyTwoWeekHigh: 550.00, fiftyTwoWeekLow: 350.00, marketCap: "₹2,50,000 Cr",
    peRatio: 20.0, pbRatio: 3.5, dividendYield: 1.2, debtToEquity: 0.2, roe: 18.0,
    promoterHolding: 73.0, promoterPledged: 0,
  },
  NESTLEIND: {
    symbol: 'NESTLEIND', name: 'Nestle India Ltd.', exchange: 'NSE', sector: 'FMCG', currentPrice: 2500.00, // Post split adjustment
    open: 2490.00, high: 2510.00, low: 2485.00, close: 2495.00, volume: 300000,
    fiftyTwoWeekHigh: 2770.00, fiftyTwoWeekLow: 2150.00, marketCap: "₹2,40,000 Cr",
    peRatio: 75.0, pbRatio: 40.0, dividendYield: 1.2, debtToEquity: 0.1, roe: 100.0, // RoE can be very high due to capital structure
    promoterHolding: 62.8, promoterPledged: 0,
  },
  SUNPHARMA: {
    symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', exchange: 'NSE', sector: 'Pharmaceuticals', currentPrice: 1500.00,
    open: 1490.00, high: 1510.00, low: 1485.00, close: 1495.00, volume: 2000000,
    fiftyTwoWeekHigh: 1600.00, fiftyTwoWeekLow: 900.00, marketCap: "₹3,60,000 Cr",
    peRatio: 35.0, pbRatio: 5.0, dividendYield: 0.8, debtToEquity: 0.2, roe: 15.0,
    promoterHolding: 54.5, promoterPledged: 3.5,
  },
  ADANIENT: {
    symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', exchange: 'NSE', sector: 'Conglomerate', currentPrice: 3100.00,
    open: 3080.00, high: 3120.00, low: 3070.00, close: 3090.00, volume: 3000000,
    fiftyTwoWeekHigh: 4000.00, fiftyTwoWeekLow: 1200.00, marketCap: "₹3,50,000 Cr",
    peRatio: 100.0, pbRatio: 10.0, dividendYield: 0.1, debtToEquity: 1.5, roe: 10.0,
    promoterHolding: 72.6, promoterPledged: 2.5,
  },
  DMART: {
    symbol: 'DMART', name: 'Avenue Supermarts Ltd.', exchange: 'NSE', sector: 'Retail', currentPrice: 4500.00,
    open: 4480.00, high: 4520.00, low: 4470.00, close: 4490.00, volume: 400000,
    fiftyTwoWeekHigh: 5000.00, fiftyTwoWeekLow: 3200.00, marketCap: "₹2,90,000 Cr",
    peRatio: 100.0, pbRatio: 15.0, dividendYield: 0, debtToEquity: 0.05, roe: 15.0,
    promoterHolding: 74.9, promoterPledged: 0,
  },
  PIDILITIND: {
    symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd.', exchange: 'NSE', sector: 'Chemicals', currentPrice: 2900.00,
    open: 2890.00, high: 2920.00, low: 2880.00, close: 2905.00, volume: 300000,
    fiftyTwoWeekHigh: 3100.00, fiftyTwoWeekLow: 2200.00, marketCap: "₹1,47,000 Cr",
    peRatio: 90.0, pbRatio: 16.0, dividendYield: 0.4, debtToEquity: 0.08, roe: 18.0,
    promoterHolding: 69.8, promoterPledged: 0,
  },
  ULTRACEMCO: {
    symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', exchange: 'NSE', sector: 'Cement', currentPrice: 9800.00,
    open: 9780.00, high: 9850.00, low: 9750.00, close: 9790.00, volume: 200000,
    fiftyTwoWeekHigh: 10500.00, fiftyTwoWeekLow: 7000.00, marketCap: "₹2,80,000 Cr",
    peRatio: 35.0, pbRatio: 4.0, dividendYield: 0.4, debtToEquity: 0.4, roe: 12.0,
    promoterHolding: 59.9, promoterPledged: 0,
  },
  // Previously Added
  HCLTECH: {
    symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', exchange: 'NSE', sector: 'IT Services & Consulting', currentPrice: 1450.00,
    open: 1440.00, high: 1460.00, low: 1435.00, close: 1445.00, volume: 2500000,
    fiftyTwoWeekHigh: 1600.00, fiftyTwoWeekLow: 1000.00, marketCap: "₹3,90,000 Cr",
    peRatio: 26.0, pbRatio: 5.5, dividendYield: 3.2, debtToEquity: 0.08, roe: 22.0,
    promoterHolding: 60.7, promoterPledged: 0,
  },
  TATAMOTORS: {
    symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', exchange: 'NSE', sector: 'Automobile', currentPrice: 675.45,
    open: 970.00, high: 990.00, low: 965.00, close: 975.00, volume: 20000000,
    fiftyTwoWeekHigh: 1065.00, fiftyTwoWeekLow: 400.00, marketCap: "₹3,25,000 Cr",
    peRatio: 16.0, pbRatio: 3.8, dividendYield: 0.2, debtToEquity: 1.5, roe: 20.0,
    promoterHolding: 46.4, promoterPledged: 0.9,
  },
  JSWSTEEL: {
    symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', exchange: 'NSE', sector: 'Metals - Ferrous', currentPrice: 830.00,
    open: 825.00, high: 835.00, low: 820.00, close: 828.00, volume: 4500000,
    fiftyTwoWeekHigh: 900.00, fiftyTwoWeekLow: 650.00, marketCap: "₹2,00,000 Cr",
    peRatio: 18.0, pbRatio: 2.5, dividendYield: 1.0, debtToEquity: 1.2, roe: 15.0,
    promoterHolding: 44.8, promoterPledged: 8.5,
  },
  TATASTEEL: {
    symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', exchange: 'NSE', sector: 'Metals - Ferrous', currentPrice: 165.00,
    open: 164.00, high: 167.00, low: 163.00, close: 166.00, volume: 50000000,
    fiftyTwoWeekHigh: 175.00, fiftyTwoWeekLow: 100.00, marketCap: "₹2,05,000 Cr",
    peRatio: 40.0, pbRatio: 1.8, dividendYield: 2.2, debtToEquity: 0.8, roe: 5.0,
    promoterHolding: 33.7, promoterPledged: 0,
  },
  "M&M": {
    symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', exchange: 'NSE', sector: 'Automobile', currentPrice: 2500.00,
    open: 2480.00, high: 2520.00, low: 2470.00, close: 2490.00, volume: 2000000,
    fiftyTwoWeekHigh: 2600.00, fiftyTwoWeekLow: 1200.00, marketCap: "₹3,10,000 Cr",
    peRatio: 25.0, pbRatio: 4.5, dividendYield: 0.8, debtToEquity: 0.6, roe: 18.0,
    promoterHolding: 19.3, promoterPledged: 0,
  },
  BAJAJFINSV: {
    symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', exchange: 'NSE', sector: 'Financial Services - Holding Company', currentPrice: 1600.00,
    open: 1590.00, high: 1610.00, low: 1585.00, close: 1595.00, volume: 800000,
    fiftyTwoWeekHigh: 1740.00, fiftyTwoWeekLow: 1200.00, marketCap: "₹2,55,000 Cr",
    peRatio: 32.0, pbRatio: 4.0, dividendYield: 0.05, debtToEquity: 3.8, roe: 14.0,
    promoterHolding: 52.5, promoterPledged: 0,
  },
  ADANIPORTS: {
    symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd.', exchange: 'NSE', sector: 'Infrastructure', currentPrice: 1350.00,
    open: 1340.00, high: 1360.00, low: 1335.00, close: 1345.00, volume: 3000000,
    fiftyTwoWeekHigh: 1425.00, fiftyTwoWeekLow: 550.00, marketCap: "₹2,90,000 Cr",
    peRatio: 35.0, pbRatio: 4.8, dividendYield: 0.4, debtToEquity: 0.9, roe: 15.0,
    promoterHolding: 65.9, promoterPledged: 3.5,
  },
  NTPC: {
    symbol: 'NTPC', name: 'NTPC Ltd.', exchange: 'NSE', sector: 'Power', currentPrice: 360.00,
    open: 358.00, high: 362.00, low: 357.00, close: 359.00, volume: 15000000,
    fiftyTwoWeekHigh: 380.00, fiftyTwoWeekLow: 160.00, marketCap: "₹3,50,000 Cr",
    peRatio: 17.0, pbRatio: 2.1, dividendYield: 2.0, debtToEquity: 1.5, roe: 13.0,
    promoterHolding: 51.1, promoterPledged: 0,
  },
  POWERGRID: {
    symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd.', exchange: 'NSE', sector: 'Power', currentPrice: 310.00,
    open: 308.00, high: 312.00, low: 307.00, close: 309.00, volume: 12000000,
    fiftyTwoWeekHigh: 330.00, fiftyTwoWeekLow: 180.00, marketCap: "₹2,88,000 Cr",
    peRatio: 18.0, pbRatio: 2.8, dividendYield: 3.5, debtToEquity: 1.9, roe: 17.0,
    promoterHolding: 51.3, promoterPledged: 0,
  },
  COALINDIA: {
    symbol: 'COALINDIA', name: 'Coal India Ltd.', exchange: 'NSE', sector: 'Mining', currentPrice: 480.00,
    open: 478.00, high: 485.00, low: 475.00, close: 482.00, volume: 8000000,
    fiftyTwoWeekHigh: 500.00, fiftyTwoWeekLow: 220.00, marketCap: "₹2,97,000 Cr",
    peRatio: 9.0, pbRatio: 3.5, dividendYield: 5.2, debtToEquity: 0.2, roe: 45.0,
    promoterHolding: 63.1, promoterPledged: 0,
  },
  ONGC: {
    symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd.', exchange: 'NSE', sector: 'Oil & Gas', currentPrice: 280.00,
    open: 278.00, high: 282.00, low: 277.00, close: 279.00, volume: 10000000,
    fiftyTwoWeekHigh: 293.00, fiftyTwoWeekLow: 150.00, marketCap: "₹3,52,000 Cr",
    peRatio: 7.5, pbRatio: 1.2, dividendYield: 4.0, debtToEquity: 0.5, roe: 16.0,
    promoterHolding: 58.9, promoterPledged: 0,
  },
  HINDALCO: {
    symbol: 'HINDALCO', name: 'Hindalco Industries Ltd.', exchange: 'NSE', sector: 'Metals - Non-ferrous', currentPrice: 650.00,
    open: 645.00, high: 655.00, low: 640.00, close: 648.00, volume: 3500000,
    fiftyTwoWeekHigh: 700.00, fiftyTwoWeekLow: 400.00, marketCap: "₹1,45,000 Cr",
    peRatio: 15.0, pbRatio: 1.5, dividendYield: 1.2, debtToEquity: 0.7, roe: 10.0,
    promoterHolding: 34.6, promoterPledged: 0,
  },
  CIPLA: {
    symbol: 'CIPLA', name: 'Cipla Ltd.', exchange: 'NSE', sector: 'Pharmaceuticals', currentPrice: 1500.00,
    open: 1490.00, high: 1510.00, low: 1485.00, close: 1495.00, volume: 1000000,
    fiftyTwoWeekHigh: 1520.00, fiftyTwoWeekLow: 900.00, marketCap: "₹1,20,000 Cr",
    peRatio: 30.0, pbRatio: 4.5, dividendYield: 0.8, debtToEquity: 0.1, roe: 15.0,
    promoterHolding: 33.4, promoterPledged: 0,
  },
  DRREDDY: {
    symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories Ltd.', exchange: 'NSE', sector: 'Pharmaceuticals', currentPrice: 6200.00,
    open: 6180.00, high: 6220.00, low: 6170.00, close: 6190.00, volume: 300000,
    fiftyTwoWeekHigh: 6500.00, fiftyTwoWeekLow: 4300.00, marketCap: "₹1,03,000 Cr",
    peRatio: 22.0, pbRatio: 4.0, dividendYield: 0.7, debtToEquity: 0.1, roe: 18.0,
    promoterHolding: 26.7, promoterPledged: 0,
  },
  BRITANNIA: {
    symbol: 'BRITANNIA', name: 'Britannia Industries Ltd.', exchange: 'NSE', sector: 'FMCG', currentPrice: 5300.00,
    open: 5280.00, high: 5320.00, low: 5270.00, close: 5290.00, volume: 200000,
    fiftyTwoWeekHigh: 5400.00, fiftyTwoWeekLow: 4200.00, marketCap: "₹1,28,000 Cr",
    peRatio: 60.0, pbRatio: 25.0, dividendYield: 1.4, debtToEquity: 0.8, roe: 45.0,
    promoterHolding: 50.5, promoterPledged: 0,
  },
  EICHERMOT: {
    symbol: 'EICHERMOT', name: 'Eicher Motors Ltd.', exchange: 'NSE', sector: 'Automobile', currentPrice: 4700.00,
    open: 4680.00, high: 4720.00, low: 4670.00, close: 4690.00, volume: 400000,
    fiftyTwoWeekHigh: 4900.00, fiftyTwoWeekLow: 3000.00, marketCap: "₹1,28,000 Cr",
    peRatio: 32.0, pbRatio: 6.0, dividendYield: 1.0, debtToEquity: 0.02, roe: 20.0,
    promoterHolding: 49.2, promoterPledged: 0,
  },
  HEROMOTOCO: {
    symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', exchange: 'NSE', sector: 'Automobile', currentPrice: 5500.00,
    open: 5480.00, high: 5520.00, low: 5470.00, close: 5490.00, volume: 300000,
    fiftyTwoWeekHigh: 5700.00, fiftyTwoWeekLow: 2500.00, marketCap: "₹1,10,000 Cr",
    peRatio: 28.0, pbRatio: 5.0, dividendYield: 2.0, debtToEquity: 0.01, roe: 18.0,
    promoterHolding: 34.8, promoterPledged: 0,
  },
  'BAJAJ-AUTO': {
    symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', exchange: 'NSE', sector: 'Automobile', currentPrice: 9500.00,
    open: 9480.00, high: 9550.00, low: 9450.00, close: 9510.00, volume: 250000,
    fiftyTwoWeekHigh: 9900.00, fiftyTwoWeekLow: 4500.00, marketCap: "₹2,65,000 Cr",
    peRatio: 34.0, pbRatio: 7.5, dividendYield: 1.5, debtToEquity: 0, roe: 22.0,
    promoterHolding: 55.0, promoterPledged: 0,
  },
  GRASIM: {
    symbol: 'GRASIM', name: 'Grasim Industries Ltd.', exchange: 'NSE', sector: 'Conglomerate', currentPrice: 2400.00,
    open: 2390.00, high: 2410.00, low: 2380.00, close: 2395.00, volume: 500000,
    fiftyTwoWeekHigh: 2500.00, fiftyTwoWeekLow: 1500.00, marketCap: "₹1,58,000 Cr",
    peRatio: 30.0, pbRatio: 2.0, dividendYield: 0.8, debtToEquity: 0.6, roe: 7.0,
    promoterHolding: 43.0, promoterPledged: 0.5,
  },
  INDUSINDBK: {
    symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', exchange: 'NSE', sector: 'Banking - Private', currentPrice: 1480.00,
    open: 1475.00, high: 1490.00, low: 1470.00, close: 1482.00, volume: 3000000,
    fiftyTwoWeekHigh: 1690.00, fiftyTwoWeekLow: 1000.00, marketCap: "₹1,15,000 Cr",
    peRatio: 13.0, pbRatio: 1.8, dividendYield: 1.1, debtToEquity: 0, roe: 15.0,
    promoterHolding: 16.4, promoterPledged: 0,
  },
  TECHM: {
    symbol: 'TECHM', name: 'Tech Mahindra Ltd.', exchange: 'NSE', sector: 'IT Services & Consulting', currentPrice: 1300.00,
    open: 1295.00, high: 1310.00, low: 1290.00, close: 1302.00, volume: 2000000,
    fiftyTwoWeekHigh: 1440.00, fiftyTwoWeekLow: 980.00, marketCap: "₹1,27,000 Cr",
    peRatio: 58.0, pbRatio: 5.0, dividendYield: 2.3, debtToEquity: 0.1, roe: 10.0,
    promoterHolding: 35.1, promoterPledged: 0,
  },
  HDFCLIFE: {
    symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd.', exchange: 'NSE', sector: 'Insurance', currentPrice: 580.00,
    open: 578.00, high: 585.00, low: 575.00, close: 582.00, volume: 2500000,
    fiftyTwoWeekHigh: 710.00, fiftyTwoWeekLow: 500.00, marketCap: "₹1,25,000 Cr",
    peRatio: 85.0, pbRatio: 8.0, dividendYield: 0.4, debtToEquity: 0, roe: 10.0,
    promoterHolding: 50.3, promoterPledged: 0,
  },
  SBILIFE: {
    symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd.', exchange: 'NSE', sector: 'Insurance', currentPrice: 1450.00,
    open: 1445.00, high: 1460.00, low: 1440.00, close: 1452.00, volume: 600000,
    fiftyTwoWeekHigh: 1570.00, fiftyTwoWeekLow: 1050.00, marketCap: "₹1,45,000 Cr",
    peRatio: 80.0, pbRatio: 10.0, dividendYield: 0.2, debtToEquity: 0, roe: 13.0,
    promoterHolding: 55.4, promoterPledged: 0,
  },
  LTIM: {
    symbol: 'LTIM', name: 'LTIMindtree Ltd.', exchange: 'NSE', sector: 'IT Services & Consulting', currentPrice: 5100.00,
    open: 5080.00, high: 5120.00, low: 5070.00, close: 5090.00, volume: 400000,
    fiftyTwoWeekHigh: 6440.00, fiftyTwoWeekLow: 4500.00, marketCap: "₹1,50,000 Cr",
    peRatio: 33.0, pbRatio: 8.0, dividendYield: 1.2, debtToEquity: 0.05, roe: 25.0,
    promoterHolding: 68.7, promoterPledged: 0,
  },
  ADANIGREEN: {
    symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd.', exchange: 'NSE', sector: 'Power', currentPrice: 1800.00,
    open: 1790.00, high: 1820.00, low: 1780.00, close: 1805.00, volume: 1500000,
    fiftyTwoWeekHigh: 2170.00, fiftyTwoWeekLow: 450.00, marketCap: "₹2,85,000 Cr",
    peRatio: 250.0, pbRatio: 40.0, dividendYield: 0, debtToEquity: 4.5, roe: 20.0,
    promoterHolding: 56.3, promoterPledged: 1.8,
  },
  ADANIPOWER: {
    symbol: 'ADANIPOWER', name: 'Adani Power Ltd.', exchange: 'NSE', sector: 'Power', currentPrice: 730.00,
    open: 725.00, high: 740.00, low: 720.00, close: 735.00, volume: 8000000,
    fiftyTwoWeekHigh: 800.00, fiftyTwoWeekLow: 230.00, marketCap: "₹2,81,000 Cr",
    peRatio: 14.0, pbRatio: 6.0, dividendYield: 0, debtToEquity: 1.8, roe: 45.0,
    promoterHolding: 74.9, promoterPledged: 15.0,
  },
  TATAPOWER: {
    symbol: 'TATAPOWER', name: 'Tata Power Company Ltd.', exchange: 'NSE', sector: 'Power', currentPrice: 430.00,
    open: 428.00, high: 435.00, low: 425.00, close: 432.00, volume: 10000000,
    fiftyTwoWeekHigh: 465.00, fiftyTwoWeekLow: 200.00, marketCap: "₹1,37,000 Cr",
    peRatio: 38.0, pbRatio: 4.0, dividendYield: 0.5, debtToEquity: 1.2, roe: 11.0,
    promoterHolding: 46.8, promoterPledged: 0.8,
  },
  TATACONSUM: {
    symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd.', exchange: 'NSE', sector: 'FMCG', currentPrice: 1100.00,
    open: 1095.00, high: 1110.00, low: 1090.00, close: 1102.00, volume: 1200000,
    fiftyTwoWeekHigh: 1270.00, fiftyTwoWeekLow: 700.00, marketCap: "₹1,03,000 Cr",
    peRatio: 90.0, pbRatio: 6.5, dividendYield: 0.8, debtToEquity: 0.1, roe: 7.5,
    promoterHolding: 34.4, promoterPledged: 0,
  },
  ZOMATO: {
    symbol: 'ZOMATO', name: 'Zomato Ltd.', exchange: 'NSE', sector: 'Platform / E-Commerce', currentPrice: 185.00,
    open: 184.00, high: 188.00, low: 182.00, close: 186.00, volume: 50000000,
    fiftyTwoWeekHigh: 207.00, fiftyTwoWeekLow: 50.00, marketCap: "₹1,64,000 Cr",
    peRatio: 450.0, pbRatio: 8.0, dividendYield: 0, debtToEquity: 0, roe: 2.0,
    promoterHolding: 0, promoterPledged: 0,
  },
  PAYTM: {
    symbol: 'PAYTM', name: 'One97 Communications Ltd. (Paytm)', exchange: 'NSE', sector: 'Financial Services - Fintech', currentPrice: 410.00,
    open: 405.00, high: 415.00, low: 400.00, close: 408.00, volume: 7000000,
    fiftyTwoWeekHigh: 998.00, fiftyTwoWeekLow: 310.00, marketCap: "₹26,000 Cr",
    peRatio: -15, pbRatio: 3.0, dividendYield: 0, debtToEquity: 0.1, roe: -20.0,
    promoterHolding: 9.1, promoterPledged: 0,
  },
  POLICYBZR: {
    symbol: 'POLICYBZR', name: 'PB Fintech Ltd. (Policybazaar)', exchange: 'NSE', sector: 'Financial Services - Fintech', currentPrice: 1250.00,
    open: 1240.00, high: 1260.00, low: 1230.00, close: 1245.00, volume: 1500000,
    fiftyTwoWeekHigh: 1400.00, fiftyTwoWeekLow: 450.00, marketCap: "₹56,000 Cr",
    peRatio: 200, pbRatio: 8.0, dividendYield: 0, debtToEquity: 0.05, roe: 4.0,
    promoterHolding: 4.3, promoterPledged: 0,
  },
  NYKAA: {
    symbol: 'NYKAA', name: 'FSN E-Commerce Ventures Ltd. (Nykaa)', exchange: 'NSE', sector: 'Platform / E-Commerce', currentPrice: 170.00,
    open: 168.00, high: 172.00, low: 167.00, close: 169.00, volume: 5000000,
    fiftyTwoWeekHigh: 210.00, fiftyTwoWeekLow: 114.00, marketCap: "₹48,000 Cr",
    peRatio: 1200, pbRatio: 18.0, dividendYield: 0, debtToEquity: 0.3, roe: 1.5,
    promoterHolding: 52.3, promoterPledged: 0,
  },
  IRCTC: {
    symbol: 'IRCTC', name: 'Indian Railway Catering & Tourism Corp Ltd.', exchange: 'NSE', sector: 'Railways', currentPrice: 1000.00,
    open: 995.00, high: 1010.00, low: 990.00, close: 1005.00, volume: 3000000,
    fiftyTwoWeekHigh: 1138.00, fiftyTwoWeekLow: 557.00, marketCap: "₹80,000 Cr",
    peRatio: 72.0, pbRatio: 22.0, dividendYield: 0.5, debtToEquity: 0, roe: 38.0,
    promoterHolding: 62.4, promoterPledged: 0,
  },
  BPCL: {
    symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd.', exchange: 'NSE', sector: 'Oil & Gas', currentPrice: 610.00,
    open: 605.00, high: 615.00, low: 600.00, close: 608.00, volume: 6000000,
    fiftyTwoWeekHigh: 687.00, fiftyTwoWeekLow: 315.00, marketCap: "₹1,32,000 Cr",
    peRatio: 5.0, pbRatio: 2.0, dividendYield: 4.0, debtToEquity: 0.6, roe: 35.0,
    promoterHolding: 52.9, promoterPledged: 0,
  },
  IOC: {
    symbol: 'IOC', name: 'Indian Oil Corporation Ltd.', exchange: 'NSE', sector: 'Oil & Gas', currentPrice: 165.00,
    open: 164.00, high: 167.00, low: 162.00, close: 166.00, volume: 15000000,
    fiftyTwoWeekHigh: 196.00, fiftyTwoWeekLow: 78.00, marketCap: "₹2,33,000 Cr",
    peRatio: 6.0, pbRatio: 1.2, dividendYield: 4.8, debtToEquity: 0.7, roe: 20.0,
    promoterHolding: 51.5, promoterPledged: 0,
  },
  RECLTD: {
    symbol: 'RECLTD', name: 'REC Ltd.', exchange: 'NSE', sector: 'Financial Services - NBFC', currentPrice: 510.00,
    open: 505.00, high: 515.00, low: 500.00, close: 508.00, volume: 7000000,
    fiftyTwoWeekHigh: 560.00, fiftyTwoWeekLow: 125.00, marketCap: "₹1,34,000 Cr",
    peRatio: 9.5, pbRatio: 2.0, dividendYield: 3.0, debtToEquity: 7.0, roe: 22.0,
    promoterHolding: 52.6, promoterPledged: 0,
  },
  PFC: {
    symbol: 'PFC', name: 'Power Finance Corporation Ltd.', exchange: 'NSE', sector: 'Financial Services - NBFC', currentPrice: 480.00,
    open: 475.00, high: 485.00, low: 470.00, close: 478.00, volume: 8000000,
    fiftyTwoWeekHigh: 530.00, fiftyTwoWeekLow: 115.00, marketCap: "₹1,58,000 Cr",
    peRatio: 6.0, pbRatio: 1.4, dividendYield: 2.8, debtToEquity: 8.5, roe: 24.0,
    promoterHolding: 55.9, promoterPledged: 0,
  },
  BANKBARODA: {
    symbol: 'BANKBARODA', name: 'Bank of Baroda', exchange: 'NSE', sector: 'Banking - PSU', currentPrice: 270.00,
    open: 268.00, high: 272.00, low: 267.00, close: 269.00, volume: 12000000,
    fiftyTwoWeekHigh: 290.00, fiftyTwoWeekLow: 140.00, marketCap: "₹1,39,000 Cr",
    peRatio: 8.0, pbRatio: 1.2, dividendYield: 2.8, debtToEquity: 0, roe: 16.0,
    promoterHolding: 63.9, promoterPledged: 0,
  },
  PNB: {
    symbol: 'PNB', name: 'Punjab National Bank', exchange: 'NSE', sector: 'Banking - PSU', currentPrice: 125.00,
    open: 124.00, high: 126.00, low: 123.00, close: 124.50, volume: 30000000,
    fiftyTwoWeekHigh: 142.00, fiftyTwoWeekLow: 48.00, marketCap: "₹1,37,000 Cr",
    peRatio: 16.0, pbRatio: 1.2, dividendYield: 1.2, debtToEquity: 0, roe: 8.0,
    promoterHolding: 73.1, promoterPledged: 0,
  },
  SAIL: {
    symbol: 'SAIL', name: 'Steel Authority of India Ltd.', exchange: 'NSE', sector: 'Metals - Ferrous', currentPrice: 150.00,
    open: 148.00, high: 152.00, low: 147.00, close: 149.00, volume: 25000000,
    fiftyTwoWeekHigh: 175.00, fiftyTwoWeekLow: 75.00, marketCap: "₹62,000 Cr",
    peRatio: 25.0, pbRatio: 1.1, dividendYield: 1.0, debtToEquity: 0.5, roe: 4.5,
    promoterHolding: 65.0, promoterPledged: 0,
  },
  GAIL: {
    symbol: 'GAIL', name: 'GAIL (India) Ltd.', exchange: 'NSE', sector: 'Oil & Gas', currentPrice: 210.00,
    open: 208.00, high: 212.00, low: 207.00, close: 209.00, volume: 14000000,
    fiftyTwoWeekHigh: 225.00, fiftyTwoWeekLow: 103.00, marketCap: "₹1,37,000 Cr",
    peRatio: 16.0, pbRatio: 1.6, dividendYield: 2.4, debtToEquity: 0.3, roe: 10.0,
    promoterHolding: 51.5, promoterPledged: 0,
  },
  DLF: {
    symbol: 'DLF', name: 'DLF Ltd.', exchange: 'NSE', sector: 'Real Estate', currentPrice: 830.00,
    open: 825.00, high: 840.00, low: 820.00, close: 835.00, volume: 4000000,
    fiftyTwoWeekHigh: 970.00, fiftyTwoWeekLow: 350.00, marketCap: "₹2,06,000 Cr",
    peRatio: 78.0, pbRatio: 4.5, dividendYield: 0.6, debtToEquity: 0.1, roe: 6.0,
    promoterHolding: 74.9, promoterPledged: 0,
  },
  VEDL: {
    symbol: 'VEDL', name: 'Vedanta Ltd.', exchange: 'NSE', sector: 'Metals - Non-ferrous', currentPrice: 450.00,
    open: 448.00, high: 455.00, low: 445.00, close: 452.00, volume: 15000000,
    fiftyTwoWeekHigh: 480.00, fiftyTwoWeekLow: 208.00, marketCap: "₹1,68,000 Cr",
    peRatio: 38.0, pbRatio: 3.0, dividendYield: 5.5, debtToEquity: 1.5, roe: 8.0,
    promoterHolding: 61.9, promoterPledged: 99.9,
  },
  INDIGO: {
    symbol: 'INDIGO', name: 'InterGlobe Aviation Ltd.', exchange: 'NSE', sector: 'Airlines', currentPrice: 4200.00,
    open: 4180.00, high: 4250.00, low: 4170.00, close: 4220.00, volume: 800000,
    fiftyTwoWeekHigh: 4600.00, fiftyTwoWeekLow: 1800.00, marketCap: "₹1,63,000 Cr",
    peRatio: 19.0, pbRatio: 12.0, dividendYield: 0, debtToEquity: -2.5, roe: -280.0,
    promoterHolding: 57.3, promoterPledged: 0,
  },
  TRENT: {
    symbol: 'TRENT', name: 'Trent Ltd.', exchange: 'NSE', sector: 'Retail', currentPrice: 4900.00,
    open: 4880.00, high: 4950.00, low: 4870.00, close: 4910.00, volume: 300000,
    fiftyTwoWeekHigh: 5100.00, fiftyTwoWeekLow: 1300.00, marketCap: "₹1,74,000 Cr",
    peRatio: 150.0, pbRatio: 30.0, dividendYield: 0.1, debtToEquity: 0.2, roe: 20.0,
    promoterHolding: 37.0, promoterPledged: 0,
  },
   // Newly added (post request)
  KALAMANDIR: {
    symbol: 'KALAMANDIR', name: 'Sai Silks (Kalamandir) Ltd.', exchange: 'NSE', sector: 'Retail', currentPrice: 165.00,
    open: 162.00, high: 168.00, low: 161.00, close: 163.00, volume: 500000,
    fiftyTwoWeekHigh: 240.00, fiftyTwoWeekLow: 150.00, marketCap: "₹2,500 Cr",
    peRatio: 25.0, pbRatio: 3.0, dividendYield: 0.5, debtToEquity: 0.4, roe: 12.0,
    promoterHolding: 60.0, promoterPledged: 0,
  },
  HAL: {
    symbol: 'HAL', name: 'Hindustan Aeronautics Ltd.', exchange: 'NSE', sector: 'Defence', currentPrice: 5150.00,
    open: 5100.00, high: 5200.00, low: 5080.00, close: 5130.00, volume: 1500000,
    fiftyTwoWeekHigh: 5490.00, fiftyTwoWeekLow: 1750.00, marketCap: "₹3,45,000 Cr",
    peRatio: 45.0, pbRatio: 11.0, dividendYield: 0.6, debtToEquity: 0.02, roe: 26.0,
    promoterHolding: 71.6, promoterPledged: 0,
  },
  RVNL: {
    symbol: 'RVNL', name: 'Rail Vikas Nigam Ltd.', exchange: 'NSE', sector: 'Railways', currentPrice: 380.00,
    open: 375.00, high: 385.00, low: 370.00, close: 378.00, volume: 25000000,
    fiftyTwoWeekHigh: 420.00, fiftyTwoWeekLow: 60.00, marketCap: "₹79,000 Cr",
    peRatio: 50.0, pbRatio: 9.0, dividendYield: 0.5, debtToEquity: 0.8, roe: 20.0,
    promoterHolding: 72.8, promoterPledged: 0,
  },
  IRFC: {
    symbol: 'IRFC', name: 'Indian Railway Finance Corporation Ltd.', exchange: 'NSE', sector: 'Railways', currentPrice: 170.00,
    open: 168.00, high: 175.00, low: 167.00, close: 172.00, volume: 40000000,
    fiftyTwoWeekHigh: 200.00, fiftyTwoWeekLow: 25.00, marketCap: "₹2,25,000 Cr",
    peRatio: 35.0, pbRatio: 4.5, dividendYield: 0.9, debtToEquity: 8.5, roe: 15.0,
    promoterHolding: 86.4, promoterPledged: 0,
  },
  MAZDOCK: {
    symbol: 'MAZDOCK', name: 'Mazagon Dock Shipbuilders Ltd.', exchange: 'NSE', sector: 'Defence', currentPrice: 3800.00,
    open: 3750.00, high: 3850.00, low: 3720.00, close: 3780.00, volume: 800000,
    fiftyTwoWeekHigh: 4200.00, fiftyTwoWeekLow: 600.00, marketCap: "₹76,000 Cr",
    peRatio: 65.0, pbRatio: 18.0, dividendYield: 0.4, debtToEquity: 0, roe: 28.0,
    promoterHolding: 84.8, promoterPledged: 0,
  },
  DATAPATTNS: {
    symbol: 'DATAPATTNS', name: 'Data Patterns (India) Ltd.', exchange: 'NSE', sector: 'Defence', currentPrice: 2900.00,
    open: 2880.00, high: 2950.00, low: 2850.00, close: 2910.00, volume: 400000,
    fiftyTwoWeekHigh: 3100.00, fiftyTwoWeekLow: 1200.00, marketCap: "₹16,000 Cr",
    peRatio: 80.0, pbRatio: 14.0, dividendYield: 0.2, debtToEquity: 0.05, roe: 20.0,
    promoterHolding: 42.4, promoterPledged: 0,
  },
  NAZARA: {
    symbol: 'NAZARA', name: 'Nazara Technologies Ltd.', exchange: 'NSE', sector: 'Media & Entertainment', currentPrice: 850.00,
    open: 840.00, high: 860.00, low: 835.00, close: 845.00, volume: 600000,
    fiftyTwoWeekHigh: 1100.00, fiftyTwoWeekLow: 500.00, marketCap: "₹6,500 Cr",
    peRatio: 100.0, pbRatio: 4.0, dividendYield: 0, debtToEquity: 0.1, roe: 5.0,
    promoterHolding: 16.7, promoterPledged: 0,
  },
  MANYAVAR: {
    symbol: 'MANYAVAR', name: 'Vedant Fashions Ltd.', exchange: 'NSE', sector: 'Retail', currentPrice: 1050.00,
    open: 1045.00, high: 1060.00, low: 1040.00, close: 1052.00, volume: 300000,
    fiftyTwoWeekHigh: 1500.00, fiftyTwoWeekLow: 900.00, marketCap: "₹25,000 Cr",
    peRatio: 60.0, pbRatio: 15.0, dividendYield: 0.8, debtToEquity: 0.2, roe: 28.0,
    promoterHolding: 74.9, promoterPledged: 0,
  },
  IEX: {
    symbol: 'IEX', name: 'Indian Energy Exchange Ltd.', exchange: 'NSE', sector: 'Power', currentPrice: 175.00,
    open: 174.00, high: 178.00, low: 173.00, close: 176.00, volume: 9000000,
    fiftyTwoWeekHigh: 200.00, fiftyTwoWeekLow: 115.00, marketCap: "₹15,000 Cr",
    peRatio: 45.0, pbRatio: 12.0, dividendYield: 1.2, debtToEquity: 0, roe: 35.0,
    promoterHolding: 0, promoterPledged: 0,
  },
  CDSL: {
    symbol: 'CDSL', name: 'Central Depository Services (India) Ltd.', exchange: 'NSE', sector: 'Capital Markets', currentPrice: 2000.00,
    open: 1990.00, high: 2020.00, low: 1980.00, close: 2005.00, volume: 1000000,
    fiftyTwoWeekHigh: 2200.00, fiftyTwoWeekLow: 900.00, marketCap: "₹21,000 Cr",
    peRatio: 50.0, pbRatio: 11.0, dividendYield: 1.0, debtToEquity: 0, roe: 25.0,
    promoterHolding: 15.0, promoterPledged: 0,
  },
  BHEL: {
    symbol: 'BHEL', name: 'Bharat Heavy Electricals Ltd.', exchange: 'NSE', sector: 'Capital Goods', currentPrice: 290.00,
    open: 288.00, high: 295.00, low: 285.00, close: 292.00, volume: 18000000,
    fiftyTwoWeekHigh: 320.00, fiftyTwoWeekLow: 70.00, marketCap: "₹1,01,000 Cr",
    peRatio: 100.0, pbRatio: 3.5, dividendYield: 0.2, debtToEquity: 0.4, roe: 4.0,
    promoterHolding: 63.2, promoterPledged: 0,
  },
  BEL: {
    symbol: 'BEL', name: 'Bharat Electronics Ltd.', exchange: 'NSE', sector: 'Defence', currentPrice: 305.00,
    open: 303.00, high: 308.00, low: 301.00, close: 306.00, volume: 20000000,
    fiftyTwoWeekHigh: 325.00, fiftyTwoWeekLow: 100.00, marketCap: "₹2,23,000 Cr",
    peRatio: 55.0, pbRatio: 12.0, dividendYield: 0.6, debtToEquity: 0, roe: 24.0,
    promoterHolding: 51.1, promoterPledged: 0,
  },
  DEEPAKNTR: {
    symbol: 'DEEPAKNTR', name: 'Deepak Nitrite Ltd.', exchange: 'NSE', sector: 'Chemicals', currentPrice: 2450.00,
    open: 2440.00, high: 2480.00, low: 2430.00, close: 2460.00, volume: 500000,
    fiftyTwoWeekHigh: 2600.00, fiftyTwoWeekLow: 1800.00, marketCap: "₹33,000 Cr",
    peRatio: 58.0, pbRatio: 7.0, dividendYield: 0.4, debtToEquity: 0.02, roe: 15.0,
    promoterHolding: 49.1, promoterPledged: 0,
  },
  AARTINDS: {
    symbol: 'AARTINDS', name: 'Aarti Industries Ltd.', exchange: 'NSE', sector: 'Chemicals', currentPrice: 690.00,
    open: 685.00, high: 700.00, low: 680.00, close: 695.00, volume: 1200000,
    fiftyTwoWeekHigh: 750.00, fiftyTwoWeekLow: 450.00, marketCap: "₹25,000 Cr",
    peRatio: 55.0, pbRatio: 4.0, dividendYield: 0.2, debtToEquity: 0.6, roe: 8.0,
    promoterHolding: 44.2, promoterPledged: 0,
  },
  DEVYANI: {
    symbol: 'DEVYANI', name: 'Devyani International Ltd.', exchange: 'NSE', sector: 'Restaurants & Cafes', currentPrice: 165.00,
    open: 164.00, high: 168.00, low: 162.00, close: 166.00, volume: 2500000,
    fiftyTwoWeekHigh: 220.00, fiftyTwoWeekLow: 140.00, marketCap: "₹20,000 Cr",
    peRatio: 180.0, pbRatio: 16.0, dividendYield: 0, debtToEquity: 1.2, roe: 12.0,
    promoterHolding: 62.9, promoterPledged: 0,
  },
  MUTHOOTFIN: {
    symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd.', exchange: 'NSE', sector: 'Financial Services - NBFC', currentPrice: 1700.00,
    open: 1690.00, high: 1720.00, low: 1680.00, close: 1705.00, volume: 700000,
    fiftyTwoWeekHigh: 1800.00, fiftyTwoWeekLow: 1000.00, marketCap: "₹68,000 Cr",
    peRatio: 16.0, pbRatio: 3.0, dividendYield: 1.4, debtToEquity: 2.8, roe: 20.0,
    promoterHolding: 73.4, promoterPledged: 0,
  },
  TATATECH: {
    symbol: 'TATATECH', name: 'Tata Technologies Ltd.', exchange: 'NSE', sector: 'IT Services & Consulting', currentPrice: 1050.00,
    open: 1040.00, high: 1060.00, low: 1035.00, close: 1045.00, volume: 3000000,
    fiftyTwoWeekHigh: 1400.00, fiftyTwoWeekLow: 1000.00, marketCap: "₹42,000 Cr",
    peRatio: 60.0, pbRatio: 12.0, dividendYield: 0.2, debtToEquity: 0.1, roe: 22.0,
    promoterHolding: 55.4, promoterPledged: 0,
  },
  IREDA: {
    symbol: 'IREDA', name: 'Indian Renewable Energy Development Agency Ltd.', exchange: 'NSE', sector: 'Financial Services - NBFC', currentPrice: 180.00,
    open: 178.00, high: 185.00, low: 175.00, close: 182.00, volume: 35000000,
    fiftyTwoWeekHigh: 215.00, fiftyTwoWeekLow: 50.00, marketCap: "₹48,000 Cr",
    peRatio: 40.0, pbRatio: 4.5, dividendYield: 0, debtToEquity: 7.0, roe: 18.0,
    promoterHolding: 75.0, promoterPledged: 0,
  },
  JIOFIN: {
    symbol: 'JIOFIN', name: 'Jio Financial Services Ltd.', exchange: 'NSE', sector: 'Financial Services - NBFC', currentPrice: 350.00,
    open: 348.00, high: 355.00, low: 345.00, close: 352.00, volume: 20000000,
    fiftyTwoWeekHigh: 395.00, fiftyTwoWeekLow: 200.00, marketCap: "₹2,22,000 Cr",
    peRatio: 140.0, pbRatio: 1.5, dividendYield: 0, roe: 1.0,
    promoterHolding: 47.1, promoterPledged: 0,
  },
  PERSISTENT: {
    symbol: 'PERSISTENT', name: 'Persistent Systems Ltd.', exchange: 'NSE', sector: 'IT Services & Consulting', currentPrice: 3800.00,
    open: 3780.00, high: 3820.00, low: 3750.00, close: 3790.00, volume: 400000,
    fiftyTwoWeekHigh: 4400.00, fiftyTwoWeekLow: 2500.00, marketCap: "₹58,000 Cr",
    peRatio: 55.0, pbRatio: 12.0, dividendYield: 0.8, debtToEquity: 0.05, roe: 23.0,
    promoterHolding: 31.2, promoterPledged: 0,
  },
  PAGEIND: {
    symbol: 'PAGEIND', name: 'Page Industries Ltd.', exchange: 'NSE', sector: 'Retail', currentPrice: 39000.00,
    open: 38800.00, high: 39200.00, low: 38700.00, close: 38950.00, volume: 10000,
    fiftyTwoWeekHigh: 45000.00, fiftyTwoWeekLow: 32000.00, marketCap: "₹43,000 Cr",
    peRatio: 80.0, pbRatio: 25.0, dividendYield: 0.5, debtToEquity: 0.3, roe: 45.0,
    promoterHolding: 46.2, promoterPledged: 0,
  },
  GLAND: {
    symbol: 'GLAND', name: 'Gland Pharma Ltd.', exchange: 'NSE', sector: 'Pharmaceuticals', currentPrice: 1800.00,
    open: 1790.00, high: 1820.00, low: 1780.00, close: 1805.00, volume: 600000,
    fiftyTwoWeekHigh: 2200.00, fiftyTwoWeekLow: 880.00, marketCap: "₹29,000 Cr",
    peRatio: 50.0, pbRatio: 3.5, dividendYield: 0, debtToEquity: 0.01, roe: 8.0,
    promoterHolding: 57.9, promoterPledged: 0,
  },
  SIEMENS: {
    symbol: 'SIEMENS', name: 'Siemens Ltd.', exchange: 'NSE', sector: 'Capital Goods', currentPrice: 7500.00,
    open: 7450.00, high: 7550.00, low: 7400.00, close: 7480.00, volume: 200000,
    fiftyTwoWeekHigh: 8000.00, fiftyTwoWeekLow: 3500.00, marketCap: "₹2,67,000 Cr",
    peRatio: 115.0, pbRatio: 16.0, dividendYield: 0.1, debtToEquity: 0.05, roe: 14.0,
    promoterHolding: 75.0, promoterPledged: 0,
  },
  GODREJCP: {
    symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd.', exchange: 'NSE', sector: 'FMCG', currentPrice: 1350.00,
    open: 1340.00, high: 1360.00, low: 1335.00, close: 1345.00, volume: 800000,
    fiftyTwoWeekHigh: 1450.00, fiftyTwoWeekLow: 900.00, marketCap: "₹1,38,000 Cr",
    peRatio: 70.0, pbRatio: 11.0, dividendYield: 0.8, debtToEquity: 0.1, roe: 16.0,
    promoterHolding: 63.2, promoterPledged: 0,
  },
  APOLLOHOSP: {
    symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd.', exchange: 'NSE', sector: 'Healthcare', currentPrice: 6200.00,
    open: 6180.00, high: 6250.00, low: 6170.00, close: 6210.00, volume: 400000,
    fiftyTwoWeekHigh: 6870.00, fiftyTwoWeekLow: 4500.00, marketCap: "₹89,000 Cr",
    peRatio: 100.0, pbRatio: 11.0, dividendYield: 0.2, debtToEquity: 0.3, roe: 12.0,
    promoterHolding: 29.3, promoterPledged: 0,
  },
  MAXHEALTH: {
    symbol: 'MAXHEALTH', name: 'Max Healthcare Institute Ltd.', exchange: 'NSE', sector: 'Healthcare', currentPrice: 850.00,
    open: 845.00, high: 855.00, low: 840.00, close: 848.00, volume: 1000000,
    fiftyTwoWeekHigh: 920.00, fiftyTwoWeekLow: 500.00, marketCap: "₹82,000 Cr",
    peRatio: 90.0, pbRatio: 9.0, dividendYield: 0.1, debtToEquity: 0.2, roe: 10.0,
    promoterHolding: 76.5, promoterPledged: 0,
  },
  FORTIS: {
    symbol: 'FORTIS', name: 'Fortis Healthcare Ltd.', exchange: 'NSE', sector: 'Healthcare', currentPrice: 470.00,
    open: 468.00, high: 475.00, low: 465.00, close: 472.00, volume: 1200000,
    fiftyTwoWeekHigh: 510.00, fiftyTwoWeekLow: 280.00, marketCap: "₹35,000 Cr",
    peRatio: 55.0, pbRatio: 3.5, dividendYield: 0, debtToEquity: 0.2, roe: 7.0,
    promoterHolding: 31.1, promoterPledged: 0,
  },
  COFORGE: {
    symbol: 'COFORGE', name: 'Coforge Ltd.', exchange: 'NSE', sector: 'IT Services & Consulting', currentPrice: 5200.00,
    open: 5180.00, high: 5250.00, low: 5170.00, close: 5210.00, volume: 300000,
    fiftyTwoWeekHigh: 6800.00, fiftyTwoWeekLow: 4000.00, marketCap: "₹32,000 Cr",
    peRatio: 42.0, pbRatio: 10.0, dividendYield: 1.5, debtToEquity: 0.2, roe: 28.0,
    promoterHolding: 55.8,
    promoterPledged: 0,
  },
  
  // BSE variants - often similar data to NSE for mock purposes
  '500325': { // BSE Reliance
    symbol: '500325', name: 'Reliance Industries Ltd.', exchange: 'BSE', sector: 'Oil & Gas', currentPrice: 2852.00,
    open: 2832.00, high: 2867.00, low: 2827.00, close: 2847.00, volume: 350000,
    fiftyTwoWeekHigh: 3005.00, fiftyTwoWeekLow: 2202.00, marketCap: "₹19,22,000 Cr",
    peRatio: 28.5, pbRatio: 3.5, dividendYield: 0.35, debtToEquity: 0.4, roe: 12.5,
    promoterHolding: 50.3, promoterPledged: 1.5, // slightly different pledge
  },
  '532540': { // BSE TCS
    symbol: '532540', name: 'Tata Consultancy Services Ltd.', exchange: 'BSE', sector: 'IT Services & Consulting', currentPrice: 3802.00,
    open: 3792.00, high: 3822.00, low: 3782.00, close: 3787.00, volume: 200000,
    fiftyTwoWeekHigh: 4002.00, fiftyTwoWeekLow: 3002.00, marketCap: "₹14,01,000 Cr",
    peRatio: 30.0, pbRatio: 12.0, dividendYield: 1.2, debtToEquity: 0.05, roe: 45.0,
    promoterHolding: 72.3, promoterPledged: 0.1,
  },
   '500209': { // BSE Infosys
    symbol: '500209', name: 'Infosys Ltd.', exchange: 'BSE', sector: 'IT Services & Consulting', currentPrice: 1551.00,
    open: 1541.00, high: 1561.00, low: 1536.00, close: 1539.00, volume: 400000,
    fiftyTwoWeekHigh: 1751.00, fiftyTwoWeekLow: 1251.00, marketCap: "₹6,51,000 Cr",
    peRatio: 25.2, pbRatio: 7.1, dividendYield: 2.1, debtToEquity: 0.1, roe: 28.9,
    promoterHolding: 15.1, promoterPledged: 0,
  },
  '500180': { // BSE HDFC Bank
    symbol: '500180', name: 'HDFC Bank Ltd.', exchange: 'BSE', sector: 'Banking - Private', currentPrice: 1451.00,
    open: 1446.00, high: 1461.00, low: 1441.00, close: 1443.00, volume: 800000,
    fiftyTwoWeekHigh: 1751.00, fiftyTwoWeekLow: 1301.00, marketCap: "₹11,01,000 Cr",
    peRatio: 18.0, pbRatio: 3.0, dividendYield: 1.1, debtToEquity: 0, roe: 17.0,
    promoterHolding: 0, promoterPledged: 0,
  },
  '532174': { // BSE ICICI Bank
    symbol: '532174', name: 'ICICI Bank Ltd.', exchange: 'BSE', sector: 'Banking - Private', currentPrice: 1051.00,
    open: 1046.00, high: 1056.00, low: 1041.00, close: 1049.00, volume: 1000000,
    fiftyTwoWeekHigh: 1151.00, fiftyTwoWeekLow: 801.00, marketCap: "₹7,51,000 Cr",
    peRatio: 17.5, pbRatio: 3.2, dividendYield: 0.7, debtToEquity: 0, roe: 16.5,
    promoterHolding: 0, promoterPledged: 0,
  },
  '500696': { // BSE HUL
    symbol: '500696', name: 'Hindustan Unilever Ltd.', exchange: 'BSE', sector: 'FMCG', currentPrice: 2381.00,
    open: 2371.00, high: 2391.00, low: 2366.00, close: 2376.00, volume: 150000,
    fiftyTwoWeekHigh: 2801.00, fiftyTwoWeekLow: 2201.00, marketCap: "₹5,61,000 Cr",
    peRatio: 55.0, pbRatio: 11.0, dividendYield: 1.5, debtToEquity: 0.02, roe: 20.0,
    promoterHolding: 61.9, promoterPledged: 0,
  },
  '500875': { // BSE ITC
    symbol: '500875', name: 'ITC Ltd.', exchange: 'BSE', sector: 'FMCG', currentPrice: 430.50,
    open: 428.50, high: 435.50, low: 427.50, close: 429.50, volume: 800000,
    fiftyTwoWeekHigh: 500.50, fiftyTwoWeekLow: 350.50, marketCap: "₹5,31,000 Cr",
    peRatio: 25.0, pbRatio: 7.0, dividendYield: 3.0, debtToEquity: 0.01, roe: 28.0,
    promoterHolding: 0, promoterPledged: 0,
  },
  '500112': { // BSE SBIN
    symbol: '500112', name: 'State Bank of India', exchange: 'BSE', sector: 'Banking - PSU', currentPrice: 750.50,
    open: 745.50, high: 755.50, low: 740.50, close: 748.50, volume: 1200000,
    fiftyTwoWeekHigh: 800.50, fiftyTwoWeekLow: 500.50, marketCap: "₹6,71,000 Cr",
    peRatio: 10.0, pbRatio: 1.8, dividendYield: 1.5, debtToEquity: 0, roe: 15.0,
    promoterHolding: 57.5, promoterPledged: 0,
  },
   '500034': { // BSE Bajaj Finance
    symbol: '500034', name: 'Bajaj Finance Ltd.', exchange: 'BSE', sector: 'Financial Services - NBFC', currentPrice: 7202.00,
    open: 7182.00, high: 7252.00, low: 7152.00, close: 7192.00, volume: 80000,
    fiftyTwoWeekHigh: 8202.00, fiftyTwoWeekLow: 6002.00, marketCap: "₹4,51,000 Cr",
    peRatio: 35.0, pbRatio: 7.5, dividendYield: 0.4, debtToEquity: 3.5, roe: 22.0,
    promoterHolding: 54.8, promoterPledged: 0,
  },
  '500247': { // BSE Kotak Bank
    symbol: '500247', name: 'Kotak Mahindra Bank Ltd.', exchange: 'BSE', sector: 'Banking - Private', currentPrice: 1751.00,
    open: 1741.00, high: 1761.00, low: 1736.00, close: 1746.00, volume: 200000,
    fiftyTwoWeekHigh: 2001.00, fiftyTwoWeekLow: 1601.00, marketCap: "₹3,51,000 Cr",
    peRatio: 20.0, pbRatio: 3.0, dividendYield: 0.1, debtToEquity: 0, roe: 14.0,
    promoterHolding: 25.9, promoterPledged: 0,
  },
  '532454': { // BSE Bharti Airtel
    symbol: '532454', name: 'Bharti Airtel Ltd.', exchange: 'BSE', sector: 'Telecom', currentPrice: 1201.00,
    open: 1191.00, high: 1211.00, low: 1186.00, close: 1196.00, volume: 500000,
    fiftyTwoWeekHigh: 1301.00, fiftyTwoWeekLow: 751.00, marketCap: "₹6,81,000 Cr",
    peRatio: 60.0, pbRatio: 6.0, dividendYield: 0.2, debtToEquity: 2.5, roe: 10.0,
    promoterHolding: 54.0, promoterPledged: 1.2,
  },
  '500510': { // BSE L&T
    symbol: '500510', name: 'Larsen & Toubro Ltd.', exchange: 'BSE', sector: 'Infrastructure', currentPrice: 3501.00,
    open: 3481.00, high: 3521.00, low: 3471.00, close: 3491.00, volume: 100000,
    fiftyTwoWeekHigh: 3801.00, fiftyTwoWeekLow: 2001.00, marketCap: "₹4,81,000 Cr",
    peRatio: 30.0, pbRatio: 5.0, dividendYield: 0.7, debtToEquity: 1.8, roe: 15.0,
    promoterHolding: 0, promoterPledged: 0,
  },
  '532500': { // BSE Maruti
    symbol: '532500', name: 'Maruti Suzuki India Ltd.', exchange: 'BSE', sector: 'Automobile', currentPrice: 11502.00,
    open: 11452.00, high: 11552.00, low: 11402.00, close: 11482.00, volume: 40000,
    fiftyTwoWeekHigh: 12002.00, fiftyTwoWeekLow: 8002.00, marketCap: "₹3,61,000 Cr",
    peRatio: 30.0, pbRatio: 4.5, dividendYield: 0.8, debtToEquity: 0.01, roe: 15.0,
    promoterHolding: 56.4, promoterPledged: 0,
  },
  '500820': { // BSE Asian Paints
    symbol: '500820', name: 'Asian Paints Ltd.', exchange: 'BSE', sector: 'Paints', currentPrice: 2851.00,
    open: 2841.00, high: 2861.00, low: 2831.00, close: 2846.00, volume: 60000,
    fiftyTwoWeekHigh: 3501.00, fiftyTwoWeekLow: 2501.00, marketCap: "₹2,71,000 Cr",
    peRatio: 50.0, pbRatio: 12.0, dividendYield: 0.8, debtToEquity: 0.1, roe: 25.0,
    promoterHolding: 52.6, promoterPledged: 2.1,
  },
  '532215': { // BSE Axis Bank
    symbol: '532215', name: 'Axis Bank Ltd.', exchange: 'BSE', sector: 'Banking - Private', currentPrice: 1081.00,
    open: 1076.00, high: 1086.00, low: 1071.00, close: 1079.00, volume: 700000,
    fiftyTwoWeekHigh: 1151.00, fiftyTwoWeekLow: 801.00, marketCap: "₹3,31,000 Cr",
    peRatio: 15.0, pbRatio: 2.0, dividendYield: 0.1, debtToEquity: 0, roe: 13.0,
    promoterHolding: 8.3, promoterPledged: 0,
  },
  '500114': { // BSE Titan
    symbol: '500114', name: 'Titan Company Ltd.', exchange: 'BSE', sector: 'Retail', currentPrice: 3551.00,
    open: 3541.00, high: 3571.00, low: 3531.00, close: 3546.00, volume: 50000,
    fiftyTwoWeekHigh: 3801.00, fiftyTwoWeekLow: 2501.00, marketCap: "₹3,16,000 Cr",
    peRatio: 85.0, pbRatio: 20.0, dividendYield: 0.3, debtToEquity: 0.7, roe: 24.0,
    promoterHolding: 52.9, promoterPledged: 0,
  },
  '507685': { // BSE Wipro
    symbol: '507685', name: 'Wipro Ltd.', exchange: 'BSE', sector: 'IT Services & Consulting', currentPrice: 480.50,
    open: 478.50, high: 482.50, low: 477.50, close: 479.50, volume: 300000,
    fiftyTwoWeekHigh: 550.50, fiftyTwoWeekLow: 350.50, marketCap: "₹2,51,000 Cr",
    peRatio: 20.0, pbRatio: 3.5, dividendYield: 1.2, debtToEquity: 0.2, roe: 18.0,
    promoterHolding: 73.0, promoterPledged: 0,
  },
  '500790': { // BSE Nestle
    symbol: '500790', name: 'Nestle India Ltd.', exchange: 'BSE', sector: 'FMCG', currentPrice: 2501.00,
    open: 2491.00, high: 2511.00, low: 2486.00, close: 2496.00, volume: 20000,
    fiftyTwoWeekHigh: 2771.00, fiftyTwoWeekLow: 2151.00, marketCap: "₹2,41,000 Cr",
    peRatio: 75.0, pbRatio: 40.0, dividendYield: 1.2, debtToEquity: 0.1, roe: 100.0,
    promoterHolding: 62.8, promoterPledged: 0,
  },
  '524715': { // BSE Sun Pharma
    symbol: '524715', name: 'Sun Pharmaceutical Industries Ltd.', exchange: 'BSE', sector: 'Pharmaceuticals', currentPrice: 1501.00,
    open: 1491.00, high: 1511.00, low: 1486.00, close: 1496.00, volume: 150000,
    fiftyTwoWeekHigh: 1601.00, fiftyTwoWeekLow: 901.00, marketCap: "₹3,61,000 Cr",
    peRatio: 35.0, pbRatio: 5.0, dividendYield: 0.8, debtToEquity: 0.2, roe: 15.0,
    promoterHolding: 54.5, promoterPledged: 3.5,
  },
  '512599': { // BSE Adani Ent
    symbol: '512599', name: 'Adani Enterprises Ltd.', exchange: 'BSE', sector: 'Conglomerate', currentPrice: 3101.00,
    open: 3081.00, high: 3121.00, low: 3071.00, close: 3091.00, volume: 200000,
    fiftyTwoWeekHigh: 4001.00, fiftyTwoWeekLow: 1201.00, marketCap: "₹3,51,000 Cr",
    peRatio: 100.0, pbRatio: 10.0, dividendYield: 0.1, debtToEquity: 1.5, roe: 10.0,
    promoterHolding: 72.6, promoterPledged: 2.5,
  },
   '540376': { // BSE DMART
    symbol: '540376', name: 'Avenue Supermarts Ltd.', exchange: 'BSE', sector: 'Retail', currentPrice: 4501.00,
    open: 4481.00, high: 4521.00, low: 4471.00, close: 4491.00, volume: 30000,
    fiftyTwoWeekHigh: 5001.00, fiftyTwoWeekLow: 3201.00, marketCap: "₹2,91,000 Cr",
    peRatio: 100.0, pbRatio: 15.0, dividendYield: 0, debtToEquity: 0.05, roe: 15.0,
    promoterHolding: 74.9, promoterPledged: 0,
  },
  '500331': { // BSE Pidilite
    symbol: '500331', name: 'Pidilite Industries Ltd.', exchange: 'BSE', sector: 'Chemicals', currentPrice: 2901.00,
    open: 2891.00, high: 2921.00, low: 2881.00, close: 2906.00, volume: 25000,
    fiftyTwoWeekHigh: 3101.00, fiftyTwoWeekLow: 2201.00, marketCap: "₹1,48,000 Cr",
    peRatio: 90.0, pbRatio: 16.0, dividendYield: 0.4, debtToEquity: 0.08, roe: 18.0,
    promoterHolding: 69.8, promoterPledged: 0,
  },
  '532538': { // BSE Ultratech
    symbol: '532538', name: 'UltraTech Cement Ltd.', exchange: 'BSE', sector: 'Cement', currentPrice: 9801.00,
    open: 9781.00, high: 9851.00, low: 9751.00, close: 9791.00, volume: 15000,
    fiftyTwoWeekHigh: 10501.00, fiftyTwoWeekLow: 7001.00, marketCap: "₹2,81,000 Cr",
    peRatio: 35.0, pbRatio: 4.0, dividendYield: 0.4, debtToEquity: 0.4, roe: 12.0,
    promoterHolding: 59.9, promoterPledged: 0,
  },
   '543960': { // BSE Kalamandir
    symbol: '543960', name: 'Sai Silks (Kalamandir) Ltd.', exchange: 'BSE', sector: 'Retail', currentPrice: 165.50,
    open: 162.50, high: 168.50, low: 161.50, close: 163.50, volume: 50000,
    fiftyTwoWeekHigh: 240.00, fiftyTwoWeekLow: 150.00, marketCap: "₹2,510 Cr",
    peRatio: 25.0, pbRatio: 3.0, dividendYield: 0.5, debtToEquity: 0.4, roe: 12.0,
    promoterHolding: 60.0, promoterPledged: 0,
  },
};

// Add BSE variants that reference the main NSE entries to avoid "used before declaration" error.
Object.assign(mockStockDetails, {
  '541154': { ...mockStockDetails.HAL, symbol: '541154', exchange: 'BSE', currentPrice: mockStockDetails.HAL.currentPrice + 2 },
  '542649': { ...mockStockDetails.DATAPATTNS, symbol: '542649', exchange: 'BSE', currentPrice: mockStockDetails.DATAPATTNS.currentPrice + 2 },
  '543287': { ...mockStockDetails.NAZARA, symbol: '543287', exchange: 'BSE', currentPrice: mockStockDetails.NAZARA.currentPrice + 2 },
  '541725': { ...mockStockDetails.IEX, symbol: '541725', exchange: 'BSE', currentPrice: mockStockDetails.IEX.currentPrice + 0.5 },
  '532894': { ...mockStockDetails.CDSL, symbol: '532894', exchange: 'BSE', currentPrice: mockStockDetails.CDSL.currentPrice + 2 },
  '500103': { ...mockStockDetails.BHEL, symbol: '500103', exchange: 'BSE', currentPrice: mockStockDetails.BHEL.currentPrice + 0.5 },
  '500049': { ...mockStockDetails.BEL, symbol: '500049', exchange: 'BSE', currentPrice: mockStockDetails.BEL.currentPrice + 0.5 },
  '543534': { ...mockStockDetails.DEVYANI, symbol: '543534', exchange: 'BSE', currentPrice: mockStockDetails.DEVYANI.currentPrice + 0.5 },
  '543536': { ...mockStockDetails.TATATECH, symbol: '543536', exchange: 'BSE', currentPrice: mockStockDetails.TATATECH.currentPrice + 2 },
  '544026': { ...mockStockDetails.IREDA, symbol: '544026', exchange: 'BSE', currentPrice: mockStockDetails.IREDA.currentPrice + 0.5 },
  '543944': { ...mockStockDetails.JIOFIN, symbol: '543944', exchange: 'BSE', currentPrice: mockStockDetails.JIOFIN.currentPrice + 0.5 },
});

const genericFinancialHealth = (baseRevenue: number, growthFactor: number): FinancialMetric[] => [
  { period: 'Q1 24', revenue: baseRevenue, netProfit: baseRevenue * 0.1, eps: baseRevenue * 0.001 },
  { period: 'Q2 24', revenue: baseRevenue * (1 + growthFactor), netProfit: baseRevenue * (1 + growthFactor) * 0.11, eps: baseRevenue * (1 + growthFactor) * 0.0011 },
  { period: 'Q3 24', revenue: baseRevenue * (1 + growthFactor*2), netProfit: baseRevenue * (1 + growthFactor*2) * 0.12, eps: baseRevenue * (1 + growthFactor*2) * 0.0012 },
  { period: 'Q4 24', revenue: baseRevenue * (1 + growthFactor*3), netProfit: baseRevenue * (1 + growthFactor*3) * 0.13, eps: baseRevenue * (1 + growthFactor*3) * 0.0013 },
];

const nseFundamentalDetails: { [key: string]: StockFundamentalData } = {
  // Original
  RELIANCE: {
    financialHealth: genericFinancialHealth(200000, 0.02),
    keyRatios: { pe: 28.5, pb: 3.5, debtToEquity: 0.4, roe: 12.5, dividendYield: 0.35 },
    shareholdingPattern: { promoter: 50.30, fii: 22.50, dii: 15.20, public: 12.00, pledgedPromoter: 0.5 },
  },
  INFY: {
    financialHealth: genericFinancialHealth(37000, 0.01),
    keyRatios: { pe: 25.2, pb: 7.1, debtToEquity: 0.1, roe: 28.9, dividendYield: 2.1 },
    shareholdingPattern: { promoter: 15.10, fii: 33.30, dii: 20.50, public: 31.10, pledgedPromoter: 0 },
  },
  TCS: {
    financialHealth: genericFinancialHealth(55000, 0.015),
    keyRatios: { pe: 30.0, pb: 12.0, dividendYield: 1.2, debtToEquity: 0.05, roe: 45.0 },
    shareholdingPattern: { promoter: 72.3, fii: 12.8, dii: 8.5, public: 6.4, pledgedPromoter: 0.1 },
  },
  HDFCBANK: {
    financialHealth: genericFinancialHealth(45000, 0.025), // Interest income as revenue for banks
    keyRatios: { pe: 18.0, pb: 3.0, dividendYield: 1.1, debtToEquity: 0, roe: 17.0 },
    shareholdingPattern: { promoter: 0, fii: 48.0, dii: 28.0, public: 24.0, pledgedPromoter: 0 },
  },
  ICICIBANK: {
    financialHealth: genericFinancialHealth(35000, 0.03),
    keyRatios: { pe: 17.5, pb: 3.2, dividendYield: 0.7, debtToEquity: 0, roe: 16.5 },
    shareholdingPattern: { promoter: 0, fii: 45.0, dii: 32.0, public: 23.0, pledgedPromoter: 0 },
  },
  HINDUNILVR: {
    financialHealth: genericFinancialHealth(14000, 0.01),
    keyRatios: { pe: 55.0, pb: 11.0, dividendYield: 1.5, debtToEquity: 0.02, roe: 20.0 },
    shareholdingPattern: { promoter: 61.9, fii: 14.5, dii: 11.3, public: 12.3, pledgedPromoter: 0 },
  },
  ITC: {
    financialHealth: genericFinancialHealth(18000, 0.012),
    keyRatios: { pe: 25.0, pb: 7.0, dividendYield: 3.0, debtToEquity: 0.01, roe: 28.0 },
    shareholdingPattern: { promoter: 0, fii: 12.9, dii: 43.1, public: 44.0, pledgedPromoter: 0 }, // DII heavy
  },
  SBIN: {
    financialHealth: genericFinancialHealth(90000, 0.02),
    keyRatios: { pe: 10.0, pb: 1.8, dividendYield: 1.5, debtToEquity: 0, roe: 15.0 },
    shareholdingPattern: { promoter: 57.5, fii: 10.2, dii: 24.5, public: 7.8, pledgedPromoter: 0 },
  },
  BAJFINANCE: {
    financialHealth: genericFinancialHealth(10000, 0.04), // NBFC growth can be high
    keyRatios: { pe: 35.0, pb: 7.5, dividendYield: 0.4, debtToEquity: 3.5, roe: 22.0 },
    shareholdingPattern: { promoter: 54.8, fii: 20.1, dii: 10.5, public: 14.6, pledgedPromoter: 0 },
  },
  KOTAKBANK: {
    financialHealth: genericFinancialHealth(15000, 0.028),
    keyRatios: { pe: 20.0, pb: 3.0, dividendYield: 0.1, debtToEquity: 0, roe: 14.0 },
    shareholdingPattern: { promoter: 25.9, fii: 38.2, dii: 15.5, public: 20.4, pledgedPromoter: 0 },
  },
  BHARTIARTL: {
    financialHealth: genericFinancialHealth(35000, 0.018),
    keyRatios: { pe: 60.0, pb: 6.0, dividendYield: 0.2, debtToEquity: 2.5, roe: 10.0 },
    shareholdingPattern: { promoter: 54.0, fii: 21.0, dii: 18.0, public: 7.0, pledgedPromoter: 1.2 },
  },
  LT: {
    financialHealth: genericFinancialHealth(40000, 0.015),
    keyRatios: { pe: 30.0, pb: 5.0, dividendYield: 0.7, debtToEquity: 1.8, roe: 15.0 },
    shareholdingPattern: { promoter: 0, fii: 25.0, dii: 35.0, public: 40.0, pledgedPromoter: 0 },
  },
  MARUTI: {
    financialHealth: genericFinancialHealth(30000, 0.01),
    keyRatios: { pe: 30.0, pb: 4.5, dividendYield: 0.8, debtToEquity: 0.01, roe: 15.0 },
    shareholdingPattern: { promoter: 56.4, fii: 22.1, dii: 13.5, public: 8.0, pledgedPromoter: 0 },
  },
  ASIANPAINT: {
    financialHealth: genericFinancialHealth(9000, 0.013),
    keyRatios: { pe: 50.0, pb: 12.0, dividendYield: 0.8, debtToEquity: 0.1, roe: 25.0 },
    shareholdingPattern: { promoter: 52.6, fii: 17.8, dii: 10.3, public: 19.3, pledgedPromoter: 2.1 },
  },
  AXISBANK: {
    financialHealth: genericFinancialHealth(25000, 0.022),
    keyRatios: { pe: 15.0, pb: 2.0, dividendYield: 0.1, debtToEquity: 0, roe: 13.0 },
    shareholdingPattern: { promoter: 8.3, fii: 50.1, dii: 25.5, public: 16.1, pledgedPromoter: 0 },
  },
  TITAN: {
    financialHealth: genericFinancialHealth(10000, 0.025),
    keyRatios: { pe: 85.0, pb: 20.0, dividendYield: 0.3, debtToEquity: 0.7, roe: 24.0 },
    shareholdingPattern: { promoter: 52.9, fii: 18.5, dii: 10.2, public: 18.4, pledgedPromoter: 0 },
  },
  WIPRO: {
    financialHealth: genericFinancialHealth(28000, 0.005), // IT growth might be slower recently
    keyRatios: { pe: 20.0, pb: 3.5, dividendYield: 1.2, debtToEquity: 0.2, roe: 18.0 },
    shareholdingPattern: { promoter: 73.0, fii: 6.8, dii: 9.5, public: 10.7, pledgedPromoter: 0 },
  },
  NESTLEIND: {
    financialHealth: genericFinancialHealth(5000, 0.015),
    keyRatios: { pe: 75.0, pb: 40.0, dividendYield: 1.2, debtToEquity: 0.1, roe: 100.0 },
    shareholdingPattern: { promoter: 62.8, fii: 12.1, dii: 9.3, public: 15.8, pledgedPromoter: 0 },
  },
  SUNPHARMA: {
    financialHealth: genericFinancialHealth(11000, 0.012),
    keyRatios: { pe: 35.0, pb: 5.0, dividendYield: 0.8, debtToEquity: 0.2, roe: 15.0 },
    shareholdingPattern: { promoter: 54.5, fii: 16.9, dii: 18.2, public: 10.4, pledgedPromoter: 3.5 },
  },
  ADANIENT: {
    financialHealth: genericFinancialHealth(20000, 0.03), // Volatile but high growth potential
    keyRatios: { pe: 100.0, pb: 10.0, dividendYield: 0.1, debtToEquity: 1.5, roe: 10.0 },
    shareholdingPattern: { promoter: 72.6, fii: 15.3, dii: 6.1, public: 6.0, pledgedPromoter: 2.5 },
  },
  DMART: {
    financialHealth: genericFinancialHealth(12000, 0.025),
    keyRatios: { pe: 100.0, pb: 15.0, dividendYield: 0, debtToEquity: 0.05, roe: 15.0 },
    shareholdingPattern: { promoter: 74.9, fii: 7.8, dii: 6.5, public: 10.8, pledgedPromoter: 0 },
  },
  PIDILITIND: {
    financialHealth: genericFinancialHealth(3000, 0.015),
    keyRatios: { pe: 90.0, pb: 16.0, dividendYield: 0.4, debtToEquity: 0.08, roe: 18.0 },
    shareholdingPattern: { promoter: 69.8, fii: 10.5, dii: 8.2, public: 11.5, pledgedPromoter: 0 },
  },
  ULTRACEMCO: {
    financialHealth: genericFinancialHealth(15000, 0.018),
    keyRatios: { pe: 35.0, pb: 4.0, dividendYield: 0.4, debtToEquity: 0.4, roe: 12.0 },
    shareholdingPattern: { promoter: 59.9, fii: 15.2, dii: 14.8, public: 10.1, pledgedPromoter: 0 },
  },
  HCLTECH: {
    financialHealth: genericFinancialHealth(30000, 0.01),
    keyRatios: { pe: 26.0, pb: 5.5, dividendYield: 3.2, debtToEquity: 0.08, roe: 22.0 },
    shareholdingPattern: { promoter: 60.7, fii: 18.5, dii: 12.1, public: 8.7, pledgedPromoter: 0 },
  },
  TATAMOTORS: {
    financialHealth: genericFinancialHealth(90000, 0.03),
    keyRatios: { pe: 16.0, pb: 3.8, dividendYield: 0.2, debtToEquity: 1.5, roe: 20.0 },
    shareholdingPattern: { promoter: 46.4, fii: 18.9, dii: 16.5, public: 18.2, pledgedPromoter: 0.9 },
  },
  JSWSTEEL: {
    financialHealth: genericFinancialHealth(45000, 0.015),
    keyRatios: { pe: 18.0, pb: 2.5, dividendYield: 1.0, debtToEquity: 1.2, roe: 15.0 },
    shareholdingPattern: { promoter: 44.8, fii: 24.1, dii: 10.2, public: 20.9, pledgedPromoter: 8.5 },
  },
  TATASTEEL: {
    financialHealth: genericFinancialHealth(60000, 0.01),
    keyRatios: { pe: 40.0, pb: 1.8, dividendYield: 2.2, debtToEquity: 0.8, roe: 5.0 },
    shareholdingPattern: { promoter: 33.7, fii: 20.5, dii: 22.3, public: 23.5, pledgedPromoter: 0 },
  },
  "M&M": {
    financialHealth: genericFinancialHealth(25000, 0.02),
    keyRatios: { pe: 25.0, pb: 4.5, dividendYield: 0.8, debtToEquity: 0.6, roe: 18.0 },
    shareholdingPattern: { promoter: 19.3, fii: 40.8, dii: 25.1, public: 14.8, pledgedPromoter: 0 },
  },
  BAJAJFINSV: {
    financialHealth: genericFinancialHealth(12000, 0.035),
    keyRatios: { pe: 32.0, pb: 4.0, dividendYield: 0.05, debtToEquity: 3.8, roe: 14.0 },
    shareholdingPattern: { promoter: 52.5, fii: 21.5, dii: 9.8, public: 16.2, pledgedPromoter: 0 },
  },
  ADANIPORTS: {
    financialHealth: genericFinancialHealth(6000, 0.04),
    keyRatios: { pe: 35.0, pb: 4.8, dividendYield: 0.4, debtToEquity: 0.9, roe: 15.0 },
    shareholdingPattern: { promoter: 65.9, fii: 14.8, dii: 12.3, public: 7.0, pledgedPromoter: 3.5 },
  },
  NTPC: {
    financialHealth: genericFinancialHealth(40000, 0.01),
    keyRatios: { pe: 17.0, pb: 2.1, dividendYield: 2.0, debtToEquity: 1.5, roe: 13.0 },
    shareholdingPattern: { promoter: 51.1, fii: 16.5, dii: 26.8, public: 5.6, pledgedPromoter: 0 },
  },
  POWERGRID: {
    financialHealth: genericFinancialHealth(11000, 0.008),
    keyRatios: { pe: 18.0, pb: 2.8, dividendYield: 3.5, debtToEquity: 1.9, roe: 17.0 },
    shareholdingPattern: { promoter: 51.3, fii: 28.1, dii: 14.5, public: 6.1, pledgedPromoter: 0 },
  },
  COALINDIA: {
    financialHealth: genericFinancialHealth(30000, 0.005),
    keyRatios: { pe: 9.0, pb: 3.5, dividendYield: 5.2, debtToEquity: 0.2, roe: 45.0 },
    shareholdingPattern: { promoter: 63.1, fii: 8.9, dii: 21.5, public: 6.5, pledgedPromoter: 0 },
  },
  ONGC: {
    financialHealth: genericFinancialHealth(150000, 0.002),
    keyRatios: { pe: 7.5, pb: 1.2, dividendYield: 4.0, debtToEquity: 0.5, roe: 16.0 },
    shareholdingPattern: { promoter: 58.9, fii: 9.1, dii: 22.8, public: 9.2, pledgedPromoter: 0 },
  },
  HINDALCO: {
    financialHealth: genericFinancialHealth(55000, 0.01),
    keyRatios: { pe: 15.0, pb: 1.5, dividendYield: 1.2, debtToEquity: 0.7, roe: 10.0 },
    shareholdingPattern: { promoter: 34.6, fii: 26.2, dii: 20.9, public: 18.3, pledgedPromoter: 0 },
  },
  CIPLA: {
    financialHealth: genericFinancialHealth(6000, 0.015),
    keyRatios: { pe: 30.0, pb: 4.5, dividendYield: 0.8, debtToEquity: 0.1, roe: 15.0 },
    shareholdingPattern: { promoter: 33.4, fii: 25.8, dii: 21.3, public: 19.5, pledgedPromoter: 0 },
  },
  DRREDDY: {
    financialHealth: genericFinancialHealth(7000, 0.018),
    keyRatios: { pe: 22.0, pb: 4.0, dividendYield: 0.7, debtToEquity: 0.1, roe: 18.0 },
    shareholdingPattern: { promoter: 26.7, fii: 28.9, dii: 24.1, public: 20.3, pledgedPromoter: 0 },
  },
  BRITANNIA: {
    financialHealth: genericFinancialHealth(4000, 0.012),
    keyRatios: { pe: 60.0, pb: 25.0, dividendYield: 1.4, debtToEquity: 0.8, roe: 45.0 },
    shareholdingPattern: { promoter: 50.5, fii: 19.8, dii: 14.3, public: 15.4, pledgedPromoter: 0 },
  },
  EICHERMOT: {
    financialHealth: genericFinancialHealth(4000, 0.025),
    keyRatios: { pe: 32.0, pb: 6.0, dividendYield: 1.0, debtToEquity: 0.02, roe: 20.0 },
    shareholdingPattern: { promoter: 49.2, fii: 29.8, dii: 10.5, public: 10.5, pledgedPromoter: 0 },
  },
  HEROMOTOCO: {
    financialHealth: genericFinancialHealth(9000, 0.01),
    keyRatios: { pe: 28.0, pb: 5.0, dividendYield: 2.0, debtToEquity: 0.01, roe: 18.0 },
    shareholdingPattern: { promoter: 34.8, fii: 33.1, dii: 18.9, public: 13.2, pledgedPromoter: 0 },
  },
  'BAJAJ-AUTO': {
    financialHealth: genericFinancialHealth(10000, 0.015),
    keyRatios: { pe: 34.0, pb: 7.5, dividendYield: 1.5, debtToEquity: 0, roe: 22.0 },
    shareholdingPattern: { promoter: 55.0, fii: 15.6, dii: 12.3, public: 17.1, pledgedPromoter: 0 },
  },
  GRASIM: {
    financialHealth: genericFinancialHealth(25000, 0.008),
    keyRatios: { pe: 30.0, pb: 2.0, dividendYield: 0.8, debtToEquity: 0.6, roe: 7.0 },
    shareholdingPattern: { promoter: 43.0, fii: 14.9, dii: 22.5, public: 19.6, pledgedPromoter: 0.5 },
  },
  INDUSINDBK: {
    financialHealth: genericFinancialHealth(12000, 0.03),
    keyRatios: { pe: 13.0, pb: 1.8, dividendYield: 1.1, debtToEquity: 0, roe: 15.0 },
    shareholdingPattern: { promoter: 16.4, fii: 38.5, dii: 25.8, public: 19.3, pledgedPromoter: 0 },
  },
  TECHM: {
    financialHealth: genericFinancialHealth(29000, 0.003),
    keyRatios: { pe: 58.0, pb: 5.0, dividendYield: 2.3, debtToEquity: 0.1, roe: 10.0 },
    shareholdingPattern: { promoter: 35.1, fii: 27.2, dii: 18.9, public: 18.8, pledgedPromoter: 0 },
  },
  HDFCLIFE: {
    financialHealth: genericFinancialHealth(15000, 0.02),
    keyRatios: { pe: 85.0, pb: 8.0, dividendYield: 0.4, debtToEquity: 0, roe: 10.0 },
    shareholdingPattern: { promoter: 50.3, fii: 30.1, dii: 8.2, public: 11.4, pledgedPromoter: 0 },
  },
  SBILIFE: {
    financialHealth: genericFinancialHealth(20000, 0.018),
    keyRatios: { pe: 80.0, pb: 10.0, dividendYield: 0.2, debtToEquity: 0, roe: 13.0 },
    shareholdingPattern: { promoter: 55.4, fii: 25.3, dii: 12.1, public: 7.2, pledgedPromoter: 0 },
  },
  LTIM: {
    financialHealth: genericFinancialHealth(9000, 0.015),
    keyRatios: { pe: 33.0, pb: 8.0, dividendYield: 1.2, debtToEquity: 0.05, roe: 25.0 },
    shareholdingPattern: { promoter: 68.7, fii: 9.8, dii: 8.5, public: 13.0, pledgedPromoter: 0 },
  },
  ADANIGREEN: {
    financialHealth: genericFinancialHealth(2000, 0.05),
    keyRatios: { pe: 250.0, pb: 40.0, dividendYield: 0, debtToEquity: 4.5, roe: 20.0 },
    shareholdingPattern: { promoter: 56.3, fii: 18.2, dii: 1.5, public: 24.0, pledgedPromoter: 1.8 },
  },
  ADANIPOWER: {
    financialHealth: genericFinancialHealth(9000, 0.04),
    keyRatios: { pe: 14.0, pb: 6.0, dividendYield: 0, debtToEquity: 1.8, roe: 45.0 },
    shareholdingPattern: { promoter: 74.9, fii: 12.1, dii: 2.5, public: 10.5, pledgedPromoter: 15.0 },
  },
  TATAPOWER: {
    financialHealth: genericFinancialHealth(13000, 0.015),
    keyRatios: { pe: 38.0, pb: 4.0, dividendYield: 0.5, debtToEquity: 1.2, roe: 11.0 },
    shareholdingPattern: { promoter: 46.8, fii: 15.0, dii: 20.0, public: 18.2, pledgedPromoter: 0.8 },
  },
  // FIX: Added missing and incomplete data for COFORGE to resolve type error.
  COFORGE: {
    financialHealth: genericFinancialHealth(3500, 0.02),
    keyRatios: { pe: 42.0, pb: 10.0, dividendYield: 1.5, debtToEquity: 0.2, roe: 28.0 },
    shareholdingPattern: { promoter: 55.8, fii: 20.0, dii: 15.0, public: 9.2, pledgedPromoter: 0 },
  },
};

const mockNews: { [key: string]: NewsItemRaw[] } = {
  RELIANCE: [
    { headline: "Reliance Retail Q4 profit up 12% YoY", source: "Moneycontrol", date: "2024-04-22", link: "#" },
    { headline: "Jio Financial Services to launch new products in insurance sector", source: "Economic Times", date: "2024-04-20", link: "#" },
  ],
  INFY: [
    { headline: "Infosys bags major AI deal from European client", source: "Livemint", date: "2024-04-21", link: "#" },
    { headline: "Infosys attrition rate drops to 12.6% in Q4", source: "Business Standard", date: "2024-04-18", link: "#" },
  ],
  default: [
    { headline: "Market sees volatility ahead of election results", source: "Reuters", date: "2024-05-15", link: "#" },
    { headline: "Sectoral rotation observed as IT stocks gain traction", source: "Bloomberg", date: "2024-05-14", link: "#" },
  ]
};

const mockAnnouncements: { [key: string]: CorporateAnnouncement[] } = {
    RELIANCE: [
      { title: "Board Meeting to consider Q4 Results", date: "2024-04-22", link: "#", category: "Board Meeting" },
      { title: "Declaration of Interim Dividend", date: "2024-03-15", link: "#", category: "Dividend" },
    ],
    INFY: [
      { title: "Announcement of strategic partnership in AI", date: "2024-04-21", link: "#", category: "General" },
      { title: "Record Date for Final Dividend", date: "2024-05-10", link: "#", category: "Dividend" },
    ],
    default: [
      { title: "Annual General Meeting scheduled for July", date: "2024-06-01", link: "#", category: "AGM" },
      { title: "Credit Rating updated by CRISIL", date: "2024-05-20", link: "#", category: "General" },
    ]
};




export const searchStocks = (query: string): Promise<StockIdentifier[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!query) {
        resolve([]);
        return;
      }
      const lowerCaseQuery = query.toLowerCase();
      const results = mockStocks.filter(stock =>
        stock.name.toLowerCase().includes(lowerCaseQuery) ||
        stock.symbol.toLowerCase().includes(lowerCaseQuery)
      );

      const deduplicated: StockIdentifier[] = [];
      const seenNames = new Set<string>();

      // First pass: add matching NSE stocks
      results.forEach(stock => {
        if (stock.exchange === 'NSE') {
          deduplicated.push(stock);
          seenNames.add(stock.name.toLowerCase());
        }
      });

      // Second pass: add BSE stocks only if their name is not already present as an NSE stock
      results.forEach(stock => {
        if (stock.exchange === 'BSE' && !seenNames.has(stock.name.toLowerCase())) {
          deduplicated.push(stock);
          seenNames.add(stock.name.toLowerCase());
        }
      });

      resolve(deduplicated.slice(0, 10));
    }, MOCK_API_DELAY / 3);
  });
};

export const getStockBasicData = (symbol: string): Promise<StockBasicData | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const stockKey = symbol.toUpperCase();
            const details = mockStockDetails[stockKey];
            if (details) {
                const change = details.currentPrice - details.close;
                const changePercent = (change / details.close) * 100;
                resolve({
                    ...details,
                    change: change,
                    changePercent: isNaN(changePercent) ? 0 : changePercent,
                });
            } else {
                const stockInfo = mockStocks.find(s => s.symbol.toUpperCase() === stockKey);
                if (stockInfo) {
                     resolve({
                        ...stockInfo,
                        currentPrice: 0, open: 0, high: 0, low: 0, close: 0, volume: 0,
                        change: 0, changePercent: 0, fiftyTwoWeekHigh: 0, fiftyTwoWeekLow: 0,
                        marketCap: "N/A", sector: "N/A"
                     });
                } else {
                    resolve(null);
                }
            }
        }, MOCK_API_DELAY);
    });
};

export const getStockFundamentalData = (symbol: string): Promise<StockFundamentalData | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const stockKey = symbol.toUpperCase().replace('&', 'and');
            const fundaments = nseFundamentalDetails[stockKey];
            if (fundaments) {
                resolve(fundaments);
            } else {
                resolve(null);
            }
        }, MOCK_API_DELAY);
    });
};

export const getNewsItemsRaw = (symbol: string): Promise<NewsItemRaw[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const stockKey = symbol.toUpperCase();
            resolve(mockNews[stockKey] || mockNews.default);
        }, MOCK_API_DELAY / 2);
    });
};

export const getCorporateAnnouncements = (symbol: string): Promise<CorporateAnnouncement[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const stockKey = symbol.toUpperCase();
            resolve(mockAnnouncements[stockKey] || mockAnnouncements.default);
        }, MOCK_API_DELAY / 2);
    });
};

export const getSectorPeers = (sector: string, currentSymbol: string): Promise<StockIdentifier[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const peers = Object.values(mockStockDetails)
                .filter(stock => stock.sector === sector && stock.symbol !== currentSymbol && stock.exchange === 'NSE')
                .sort((a, b) => {
                    const marketCapA = parseFloat(a.marketCap.replace(/[^0-9.]/g, ''));
                    const marketCapB = parseFloat(b.marketCap.replace(/[^0-9.]/g, ''));
                    return marketCapB - marketCapA;
                })
                .slice(0, 4)
                .map(({ symbol, name, exchange }) => ({ symbol, name, exchange }));
            resolve(peers);
        }, MOCK_API_DELAY / 2);
    });
};

export const getStockPriceHistory = (symbol: string, interval: ChartInterval): Promise<PriceDataPoint[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const basePrice = mockStockDetails[symbol.toUpperCase()]?.currentPrice || 1000;
            const data: PriceDataPoint[] = [];
            let numPoints = 100;
            if (interval === '1m') numPoints = 120;
            if (interval === '5m') numPoints = 78;
            if (interval === '15m') numPoints = 26;
            if (interval === '1h') numPoints = 7;
            if (interval === '1D') numPoints = 90;

            const now = new Date();
            for (let i = numPoints - 1; i >= 0; i--) {
                const variation = (Math.random() - 0.5) * (basePrice * 0.02);
                const price = parseFloat((basePrice + variation * (i/numPoints)).toFixed(2));
                let time = '';
                
                if (interval === '1D') {
                    const d = new Date(now);
                    d.setDate(d.getDate() - i);
                    time = d.toISOString().split('T')[0];
                } else {
                     const d = new Date(now);
                     const minutesToSubtract = (interval === '1m' ? i : interval === '5m' ? i*5 : interval === '15m' ? i*15 : i*60);
                     d.setMinutes(d.getMinutes() - minutesToSubtract);
                     time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                }
                
                data.push({ time, price });
            }
            resolve(data);
        }, MOCK_API_DELAY);
    });
};

export const getSectors = (): string[] => {
    const sectors = new Set(Object.values(mockStockDetails).map(s => s.sector));
    return Array.from(sectors).sort();
};

export const filterStocks = (criteria: ScreenerCriteria): Promise<StockBasicData[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      let filtered = Object.values(mockStockDetails).map(details => {
        const change = details.currentPrice - details.close;
        const changePercent = (change / details.close) * 100;
        return { ...details, change, changePercent: isNaN(changePercent) ? 0 : changePercent };
      });

      if (criteria.sector) {
        filtered = filtered.filter(s => s.sector.toLowerCase() === criteria.sector!.toLowerCase());
      }
      if (criteria.price_lt !== undefined) {
        filtered = filtered.filter(s => s.currentPrice < criteria.price_lt!);
      }
      if (criteria.price_gt !== undefined) {
        filtered = filtered.filter(s => s.currentPrice > criteria.price_gt!);
      }
      if (criteria.marketCap_gt !== undefined) {
        filtered = filtered.filter(s => parseFloat(s.marketCap.replace(/[^0-9.]/g, '')) * 1000 > criteria.marketCap_gt!);
      }
      if (criteria.marketCap_lt !== undefined) {
        filtered = filtered.filter(s => parseFloat(s.marketCap.replace(/[^0-9.]/g, '')) * 1000 < criteria.marketCap_lt!);
      }
      if (criteria.peRatio_lt !== undefined) {
        filtered = filtered.filter(s => s.peRatio !== undefined && s.peRatio < criteria.peRatio_lt!);
      }
      if (criteria.peRatio_gt !== undefined) {
        filtered = filtered.filter(s => s.peRatio !== undefined && s.peRatio > criteria.peRatio_gt!);
      }
      if (criteria.dividendYield_gt !== undefined) {
        filtered = filtered.filter(s => s.dividendYield !== undefined && s.dividendYield > criteria.dividendYield_gt!);
      }
      if (criteria.performance) {
          if(criteria.performance === 'gained_week') filtered = filtered.sort((a,b) => b.changePercent - a.changePercent);
          if(criteria.performance === 'lost_week') filtered = filtered.sort((a,b) => a.changePercent - b.changePercent);
      }
      
      resolve(filtered.slice(0, criteria.limit || 50));
    }, MOCK_API_DELAY);
  });
};


