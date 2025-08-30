// AI-POWERED INVOICE PARSING SYSTEM
// This system parses invoices and matches parts to our comprehensive library

import completePartsLibrary from '@/data/parts-library';

export interface ParsedInvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
  sku?: string;
  manufacturer?: string;
  confidence: number; // 0-1 confidence score for part matching
  matchedPart?: {
    id: string;
    name: string;
    sku: string;
    manufacturer: string;
    category: string;
    series: string;
  };
}

export interface ParsedInvoice {
  vendor: string;
  invoice_number: string;
  date: string;
  total_amount: number;
  items: ParsedInvoiceItem[];
  parsing_confidence: number;
}

// Common vendor patterns for better parsing
const VENDOR_PATTERNS = {
  gobilda: ['gobilda', 'go-bilda', 'gb'],
  rev: ['rev robotics', 'revrobotics', 'rev', 'first choice'],
  andymark: ['andymark', 'andy mark', 'am'],
  vex: ['vexrobotics', 'vex robotics', 'vex'],
  wcp: ['west coast products', 'wcp']
};

// SKU patterns for different manufacturers
const SKU_PATTERNS = {
  gobilda: /^(?:GB-)?(\d{4}-\d{4}-\d{4}|\d{4}-\d{3,4})$/i,
  rev: /^REV-\d{2}-\d{4}$/i,
  andymark: /^am-\d{4}[a-z]?$/i
};

// Advanced text parsing using regex patterns
export function parseInvoiceText(text: string): ParsedInvoice {
  console.log('🔍 Starting AI invoice parsing...');
  
  // Extract vendor information
  const vendor = extractVendor(text);
  console.log(`📊 Detected vendor: ${vendor}`);
  
  // Extract invoice metadata
  const invoiceNumber = extractInvoiceNumber(text);
  const date = extractDate(text);
  const totalAmount = extractTotalAmount(text);
  
  // Extract line items
  const items = extractLineItems(text, vendor);
  console.log(`📦 Found ${items.length} items for parsing`);
  
  // Match items to our parts library
  const enhancedItems = items.map(item => enhanceWithPartMatching(item, vendor));
  
  // Calculate overall parsing confidence
  const parsing_confidence = calculateParsingConfidence(enhancedItems);
  
  const result: ParsedInvoice = {
    vendor,
    invoice_number: invoiceNumber,
    date,
    total_amount: totalAmount,
    items: enhancedItems,
    parsing_confidence
  };
  
  console.log(`✅ Parsing complete with ${(parsing_confidence * 100).toFixed(1)}% confidence`);
  return result;
}

function extractVendor(text: string): string {
  const lowerText = text.toLowerCase();
  
  for (const [vendor, patterns] of Object.entries(VENDOR_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        return vendor.charAt(0).toUpperCase() + vendor.slice(1);
      }
    }
  }
  
  // Try to extract from common invoice headers
  const vendorMatch = text.match(/(?:from|bill from|vendor)[\s:]*([^\n\r]{1,50})/i);
  if (vendorMatch) {
    return vendorMatch[1].trim();
  }
  
  return 'Unknown Vendor';
}

function extractInvoiceNumber(text: string): string {
  const patterns = [
    /invoice\s*#?:?\s*([a-z0-9-]+)/i,
    /inv\s*#?:?\s*([a-z0-9-]+)/i,
    /order\s*#?:?\s*([a-z0-9-]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  
  return 'N/A';
}

function extractDate(text: string): string {
  const datePatterns = [
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
    /\b(\d{4}-\d{2}-\d{2})\b/,
    /\b(\w{3,9}\s+\d{1,2},?\s+\d{4})\b/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  
  return new Date().toISOString().split('T')[0];
}

function extractTotalAmount(text: string): number {
  const totalPatterns = [
    /total[\s:]*\$?(\d+\.?\d*)/i,
    /amount due[\s:]*\$?(\d+\.?\d*)/i,
    /grand total[\s:]*\$?(\d+\.?\d*)/i
  ];
  
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) return parseFloat(match[1]);
  }
  
  return 0;
}

function extractLineItems(text: string, vendor: string): ParsedInvoiceItem[] {
  const lines = text.split('\n');
  const items: ParsedInvoiceItem[] = [];
  
  console.log(`🔍 Extracting line items for ${vendor}...`);
  console.log(`📄 Processing ${lines.length} lines from OCR/PDF text`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.length < 5) continue;
    
    // Skip header lines and non-item lines
    if (isHeaderOrNonItemLine(line)) continue;
    
    // Look for line items with price patterns (more flexible for OCR)
    const lineItem = parseLineItemFlexible(line, vendor);
    if (lineItem) {
      items.push(lineItem);
      console.log(`📦 Found item: ${lineItem.description} (${lineItem.quantity}x $${lineItem.price})`);
    }
  }
  
  // If we found very few items, try a more aggressive parsing approach
  if (items.length < 2) {
    console.log('🔄 Low item count, trying aggressive parsing...');
    return extractLineItemsAggressive(text, vendor);
  }
  
  return items;
}

function isHeaderOrNonItemLine(line: string): boolean {
  const lowerLine = line.toLowerCase();
  
  // Skip obvious header/footer patterns
  const skipPatterns = [
    'invoice', 'receipt', 'bill to', 'ship to', 'customer', 'address', 
    'phone', 'email', 'fax', 'website', 'www', 'zip', 'state',
    'thank you', 'page', 'continued', 'terms', 'conditions', 'policy',
    'subtotal', 'tax', 'shipping', 'handling', 'discount', 'total due',
    'payment', 'method', 'card', 'check', 'cash', 'balance',
    'date', 'time', 'order', 'number', '#'
  ];
  
  // Skip lines that are clearly headers (no prices or quantities)
  if (skipPatterns.some(pattern => lowerLine.includes(pattern))) {
    return true;
  }
  
  // Skip lines that look like phone numbers or zip codes
  if (/^\d{3}-\d{3}-\d{4}$/.test(line.trim()) || /^\d{5}(-\d{4})?$/.test(line.trim())) {
    return true;
  }
  
  // Skip lines that are just numbers or single words
  if (line.trim().length < 8 || /^\d+$/.test(line.trim()) || /^\w+$/.test(line.trim())) {
    return true;
  }
  
  return false;
}

function extractLineItemsAggressive(text: string, vendor: string): ParsedInvoiceItem[] {
  const items: ParsedInvoiceItem[] = [];
  const lines = text.split('\n');
  
  console.log('🎯 Starting aggressive parsing - looking for product lines...');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 10) continue;
    
    // Skip header/footer lines
    if (isHeaderOrNonItemLine(trimmed)) continue;
    
    // Look for lines that contain both text (product name) and prices
    // Must have: some text + dollar amount or decimal number > 1
    const hasText = /[a-zA-Z]{3,}/.test(trimmed); // At least 3 letters
    const pricePattern = /\$?(\d+\.?\d*)/g;
    const priceMatches = trimmed.match(pricePattern);
    
    if (hasText && priceMatches) {
      const prices = priceMatches.map(p => parseFloat(p.replace('$', ''))).filter(p => p > 1);
      
      if (prices.length > 0) {
        // Find the most likely price (usually the largest reasonable number)
        const price = prices.find(p => p > 5 && p < 10000) || Math.max(...prices);
        
        // Extract description - everything before numbers/prices
        let description = trimmed.replace(/\$?\d+\.?\d*/g, '').trim();
        description = description.replace(/\s+/g, ' ').substring(0, 50);
        
        // Find quantity (small number, usually 1-20)
        const numbers = trimmed.match(/\b(\d+)\b/g)?.map(n => parseInt(n)) || [];
        const quantity = numbers.find(n => n > 0 && n <= 20) || 1;
        
        if (description.length > 3 && price > 0) {
          items.push({
            description: cleanDescription(description),
            quantity,
            price,
            total: price * quantity,
            confidence: 0.4 // Medium-low confidence for aggressive parsing
          });
          
          console.log(`📦 Found potential item: "${description}" - $${price} x${quantity}`);
        }
      }
    }
  }
  
  console.log(`🎯 Aggressive parsing found ${items.length} items`);
  return items.slice(0, 10); // Limit to 10 items to avoid noise
}

function cleanDescription(desc: string): string {
  return desc
    .replace(/[^\w\s-]/g, ' ') // Remove special chars except hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 100); // Limit length
}

function parseLineItemFlexible(line: string, vendor: string): ParsedInvoiceItem | null {
  // More flexible patterns for OCR text
  const flexiblePatterns = [
    // Pattern: Any text followed by numbers and prices (very flexible)
    /^(.+?)\s*(\d+)\s*.*?\$?(\d+\.?\d*)\s*.*?\$?(\d+\.?\d*)$/i,
    // Pattern: Text with embedded numbers and price at end
    /^(.+?)\s+\$?(\d+\.?\d*)$/i,
    // Pattern: SKU-like followed by text and price
    /^([A-Z0-9-]+)\s+(.+?)\s+\$?(\d+\.?\d*)$/i,
  ];
  
  for (const pattern of flexiblePatterns) {
    const match = line.match(pattern);
    if (match) {
      const result = parseMatchedLine(match, pattern);
      if (result) {
        return {
          ...result,
          confidence: 0.6 // Medium confidence for flexible parsing
        };
      }
    }
  }
  
  // Fall back to original parsing
  return parseLineItem(line, vendor);
}

function parseLineItem(line: string, vendor: string): ParsedInvoiceItem | null {
  // Common line item patterns
  const patterns = [
    // Pattern: SKU Description Qty Price Total
    /^([A-Z0-9-]+)\s+(.+?)\s+(\d+)\s+\$?(\d+\.?\d*)\s+\$?(\d+\.?\d*)$/i,
    // Pattern: Description Qty @ Price = Total
    /^(.+?)\s+(\d+)\s+@\s+\$?(\d+\.?\d*)\s+=\s+\$?(\d+\.?\d*)$/i,
    // Pattern: Qty Description Price Total
    /^(\d+)\s+(.+?)\s+\$?(\d+\.?\d*)\s+\$?(\d+\.?\d*)$/i,
    // Pattern: Description Price (single item)
    /^(.+?)\s+\$?(\d+\.?\d*)$/i
  ];
  
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      // Parse based on pattern type
      const item = parseMatchedLine(match, pattern);
      if (item) {
        return {
          ...item,
          confidence: 0.5 // Base confidence, will be enhanced with part matching
        };
      }
    }
  }
  
  return null;
}

function parseMatchedLine(match: RegExpMatchArray, pattern: RegExp): Omit<ParsedInvoiceItem, 'confidence'> | null {
  try {
    const patternStr = pattern.toString();
    
    if (patternStr.includes('([A-Z0-9-]+)')) {
      // SKU pattern
      return {
        sku: match[1],
        description: match[2] || 'Unknown Item',
        quantity: parseInt(match[3]) || 1,
        price: parseFloat(match[4]) || 0,
        total: parseFloat(match[5]) || 0
      };
    } else if (patternStr.includes('@')) {
      // @ pattern
      return {
        description: match[1] || 'Unknown Item',
        quantity: parseInt(match[2]) || 1,
        price: parseFloat(match[3]) || 0,
        total: parseFloat(match[4]) || 0
      };
    } else if (patternStr.includes('(\\d+)\\s+(.+?)')) {
      // Qty first pattern
      return {
        quantity: parseInt(match[1]) || 1,
        description: match[2] || 'Unknown Item',
        price: parseFloat(match[3]) || 0,
        total: parseFloat(match[4]) || 0
      };
    } else {
      // Simple description + price
      return {
        description: match[1] || 'Unknown Item',
        quantity: 1,
        price: parseFloat(match[2]) || 0,
        total: parseFloat(match[2]) || 0
      };
    }
  } catch (error) {
    console.warn('Failed to parse line item:', error);
    return null;
  }
}

// AI-POWERED PART MATCHING
function enhanceWithPartMatching(item: ParsedInvoiceItem, vendor: string): ParsedInvoiceItem {
  console.log(`🤖 AI matching part: ${item.description}`);
  
  let bestMatch: ParsedInvoiceItem['matchedPart'] | undefined;
  let bestScore = 0;
  
  // Search through our comprehensive parts library
  for (const part of completePartsLibrary) {
    const score = calculateMatchScore(item, part, vendor);
    
    if (score > bestScore && score > 0.3) { // Minimum confidence threshold
      bestScore = score;
      bestMatch = {
        id: part.id,
        name: part.name,
        sku: part.variants[0]?.sku || 'N/A',
        manufacturer: part.manufacturer,
        category: part.category,
        series: part.series
      };
    }
  }
  
  const enhancedItem: ParsedInvoiceItem = {
    ...item,
    confidence: bestScore,
    matchedPart: bestMatch
  };
  
  if (bestMatch) {
    console.log(`✅ Matched to: ${bestMatch.name} (${(bestScore * 100).toFixed(1)}% confidence)`);
    enhancedItem.manufacturer = bestMatch.manufacturer;
  } else {
    console.log(`❌ No match found for: ${item.description}`);
  }
  
  return enhancedItem;
}

function calculateMatchScore(item: ParsedInvoiceItem, part: any, vendor: string): number {
  let score = 0;
  
  // Vendor matching (high weight)
  if (part.manufacturer.toLowerCase() === vendor.toLowerCase()) {
    score += 0.4;
  }
  
  // SKU exact matching (highest weight)
  if (item.sku && part.variants.some((v: any) => v.sku === item.sku)) {
    score += 0.6;
    return Math.min(score, 1.0); // Perfect match
  }
  
  // Description matching using keywords
  const itemDesc = item.description.toLowerCase();
  const partName = part.name.toLowerCase();
  const partSeries = part.series.toLowerCase();
  
  // Extract key terms
  const itemTerms = extractKeyTerms(itemDesc);
  const partTerms = extractKeyTerms(partName + ' ' + partSeries);
  
  // Calculate term overlap
  const overlap = itemTerms.filter(term => partTerms.includes(term)).length;
  const termScore = overlap / Math.max(itemTerms.length, 1);
  score += termScore * 0.3;
  
  // Series number matching (for GoBILDA)
  const seriesMatch = itemDesc.match(/\b(\d{4})\b/);
  if (seriesMatch && partName.includes(seriesMatch[1])) {
    score += 0.3;
  }
  
  // Price matching (loose comparison)
  if (item.price > 0 && part.variants.length > 0) {
    const partPrice = part.variants[0].price;
    const priceDiff = Math.abs(item.price - partPrice) / partPrice;
    if (priceDiff < 0.2) { // Within 20%
      score += 0.1;
    }
  }
  
  return Math.min(score, 1.0);
}

function extractKeyTerms(text: string): string[] {
  const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  return text
    .split(/[\s-_]+/)
    .map(term => term.toLowerCase().replace(/[^\w]/g, ''))
    .filter(term => term.length > 2 && !stopWords.includes(term));
}

function calculateParsingConfidence(items: ParsedInvoiceItem[]): number {
  if (items.length === 0) return 0;
  
  const avgConfidence = items.reduce((sum, item) => sum + item.confidence, 0) / items.length;
  const matchedItems = items.filter(item => item.matchedPart).length;
  const matchRate = matchedItems / items.length;
  
  // Combine average confidence with match rate
  return (avgConfidence * 0.7) + (matchRate * 0.3);
}

// SMART INVENTORY SUGGESTIONS
export function generateInventorySuggestions(parsedItems: ParsedInvoiceItem[]): {
  toAdd: ParsedInvoiceItem[];
  suggestions: string[];
} {
  const toAdd = parsedItems.filter(item => 
    item.matchedPart && item.confidence > 0.5
  );
  
  const suggestions = [
    `Found ${toAdd.length} parts ready to add to inventory`,
    `${parsedItems.length - toAdd.length} items need manual review`,
    toAdd.length > 5 ? 'Consider bulk adding these items' : '',
    parsedItems.some(item => item.manufacturer === 'GoBILDA') ? 'GoBILDA parts detected' : '',
    parsedItems.some(item => item.manufacturer === 'REV') ? 'REV parts detected' : ''
  ].filter(Boolean);
  
  return { toAdd, suggestions };
}

// Export main parsing function
export { parseInvoiceText as default };
