// Client-safe utility functions (no Node.js dependencies)

export function getPricingColor(pricing: string): string {
  switch (pricing) {
    case 'Free':
      return 'bg-green-100 text-green-800';
    case 'Freemium':
      return 'bg-blue-100 text-blue-800';
    case 'Paid':
      return 'bg-orange-100 text-orange-800';
    case 'Enterprise':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
