import { validateObjectId } from "../utils/validateObjectId.js";

const validateParticipantIds = (ids, fieldName = "IDs") => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, `${fieldName} must be a non-empty array`);
  }

  ids.forEach((id) => {
    validateObjectId(id, fieldName);
  });
};

export { validateParticipantIds };
