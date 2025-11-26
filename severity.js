// Rule-based severity calculation
export function calculateSeverity(issue) {
  let score = 1;

  const description = issue.description.toLowerCase();
  const category = issue.category.toLowerCase();

  const dangerKeywords = ['danger', 'accident', 'injury', 'emergency', 'urgent', 'critical', 'severe'];
  const hasDangerKeyword = dangerKeywords.some((keyword) => description.includes(keyword));

  const highPriorityCategories = ['pothole', 'streetlight', 'water leakage', 'drainage'];
  const isHighPriorityCategory = highPriorityCategories.includes(category);

  const aiPredictions = issue.aiPredictions || [];
  const hasDangerousPrediction = aiPredictions.some(
    (pred) =>
      pred.className.toLowerCase().includes('pothole') ||
      pred.className.toLowerCase().includes('damage') ||
      pred.className.toLowerCase().includes('broken')
  );

  if (hasDangerKeyword) score += 2;
  if (isHighPriorityCategory) score += 1;
  if (hasDangerousPrediction) score += 1;

  if (score >= 4) return 'critical';
  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}
