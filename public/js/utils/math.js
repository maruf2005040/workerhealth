export const safeSqrt = (val) => {
    return Math.sqrt(Math.max(0, val));
};

export const calculateScore = ({ height, weight, age, experience, rating }) => {
    // 1. Height Score (h)
    // Formula: 10 * max(0, min(((h-142)/30)^.5, ((198-h)/26)^.5))
    const hScore = 10 * Math.max(0, Math.min(
        safeSqrt((height - 142) / 30),
        safeSqrt((198 - height) / 26)
    ));

    // 2. Weight Score (w)
    // Formula: 10 * max(0, min(((w-50)/15)^.5, ((90-w)/25)^.5))
    const wScore = 10 * Math.max(0, Math.min(
        safeSqrt((weight - 50) / 15),
        safeSqrt((90 - weight) / 25)
    ));

    // 3. Age Score (a)
    // Formula: 10 * max(0, min(((a-18)/12)^.5, 1, ((60-a)/20)^.5))
    const aScore = 10 * Math.max(0, Math.min(
        safeSqrt((age - 18) / 12),
        1,
        safeSqrt((60 - age) / 20)
    ));

    // 4. Experience Score (e)
    // Formula: 10 * max(0, min((e/7)^1.5, 1))
    const eScore = 10 * Math.max(0, Math.min(
        Math.pow(experience / 7, 1.5),
        1
    ));

    // 5. Personal Rating Score (p) = p
    const pScore = rating;

    // Total Score
    // Formula: h*.15 + w*.15 + a*.15 + e*.15 + p*.4
    const total = (hScore * 0.15) + (wScore * 0.15) + (aScore * 0.15) + (eScore * 0.15) + (pScore * 0.4);

    return {
        total: total.toFixed(2),
        details: { hScore, wScore, aScore, eScore, pScore }
    };
};
