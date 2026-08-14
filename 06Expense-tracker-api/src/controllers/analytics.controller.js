import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import { getMonthlySummaryService } from "../services/analytics.service.js";

const getMonthlySummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const userId = req.user._id;

  const monthlySummary = await getMonthlySummaryService(userId, month, year);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        monthlySummary,
        "Monthly summary fetched successfully",
      ),
    );
});

export { getMonthlySummary };
