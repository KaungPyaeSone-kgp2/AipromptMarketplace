/**
 * @typedef {Object} Prompt
 * @property {string} id
 * @property {string} title
 * @property {string} [imageUrl]
 * @property {string} model - One of LANGUAGE_MODELS
 * @property {string} category - One of CATEGORIES
 * @property {number} rating - 1–5
 * @property {number} [price]
 * @property {string} [creator]
 * @property {string} [description]
 * @property {string} [promptText]
 * @property {string} [purchasedAt]
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} displayName
 * @property {string} email
 * @property {string} avatarUrl
 * @property {number} points
 * @property {boolean} isCreator
 * @property {number} [followingCount]
 * @property {number} [purchasedPromptsCount]
 * @property {number} [followersCount]
 * @property {number} [postedPromptCount]
 * @property {number} [totalSalesCount]
 * @property {number} [totalEarningCoins]
 * @property {string|null} [joinedAt]
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} userId
 * @property {string} message
 * @property {boolean} isRead
 */

/**
 * @typedef {Object} HomePromptFilters
 * @property {string[]} models
 * @property {string[]} categories
 * @property {number} minRating
 * @property {string} [search]
 */
