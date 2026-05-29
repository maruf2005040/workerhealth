export const safeSqrt = (val) => Math.sqrt(Math.max(0, val));

export const calculateScore = ({ height, weight, age, experience, rating }) => {
    const hScore = 10 * Math.max(0, Math.min(safeSqrt((height - 142) / 30), safeSqrt((198 - height) / 26)));
    const wScore = 10 * Math.max(0, Math.min(safeSqrt((weight - 50) / 15), safeSqrt((90 - weight) / 25)));
    const aScore = 10 * Math.max(0, Math.min(safeSqrt((age - 18) / 12), 1, safeSqrt((60 - age) / 20)));
    const eScore = 10 * Math.max(0, Math.min(Math.pow(experience / 7, 1.5), 1));
    const pScore = rating;
    const total = (hScore * 0.15) + (wScore * 0.15) + (aScore * 0.15) + (eScore * 0.15) + (pScore * 0.4);
    return { total: total.toFixed(2), details: { hScore, wScore, aScore, eScore, pScore } };
};