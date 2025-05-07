
/**
 * Generates mock session data for client progress charts
 */
export function generateProgressChartData() {
  const sessions = [1, 2, 3, 4, 5, 6, 7, 8];
  return sessions.map(session => ({
    session: `Session ${session}`,
    anxiety: Math.floor(Math.random() * 30) + 50 - session * 3, // Decreasing trend
    depression: Math.floor(Math.random() * 25) + 45 - session * 2, // Decreasing trend
    wellbeing: Math.floor(Math.random() * 20) + 40 + session * 4, // Increasing trend
  }));
}

/**
 * Calculates progress metrics based on chart data and selected measure
 */
export function calculateProgressMetrics(chartData: any[], selectedMeasure: string) {
  const initialValue = chartData[0][selectedMeasure];
  const currentValue = chartData[chartData.length - 1][selectedMeasure];
  const changePercentage = Math.round(((initialValue - currentValue) / initialValue) * 100);
  
  // For wellbeing, we want to show improvement as a positive percentage
  const displayPercentage = selectedMeasure === "wellbeing" ? 
    Math.abs(Math.round(((currentValue - initialValue) / initialValue) * 100)) :
    Math.abs(changePercentage);
  
  const isImprovement = (selectedMeasure === "wellbeing" && currentValue > initialValue) || 
                        (selectedMeasure !== "wellbeing" && currentValue < initialValue);

  return {
    initialValue,
    currentValue,
    changePercentage,
    displayPercentage,
    isImprovement
  };
}
