const SettingsService = require('../../service/settingsService');
const SavedRepliesService = require('../../service/savedRepliesService');
const sharedResolvers = require('../sharedResolvers');

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        findClientTermsAndConditions: async (root, args, context) => {
            try {
                const settingsService = new SettingsService(context.currentUser, context.language)
                return await settingsService.getClientTermsAndConditions()
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        findClientPrivacyPolicy: async (root, args, context) => {
            try {
                const settingsService = new SettingsService(context.currentUser, context.language)
                return await settingsService.getClientPrivacyPolicy()
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        findChefTermsAndConditions: async (root, args, context) => {
            try {
                const settingsService = new SettingsService(context.currentUser, context.language);
                return await settingsService.getChefTermsAndConditions()
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        findChefPrivacyPolicy: async (root, args, context) => {
            try {
                const settingsService = new SettingsService(context.currentUser, context.language);
                return await settingsService.getChefPrivacyPolicy();
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        findCaptainTermsAndConditions: async (root, args, context) => {
            try {
                const settingsService = new SettingsService(context.currentUser, context.language);
                return await settingsService.getCaptainTermsAndConditions();
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        findCaptainPrivacyPolicy: async (root, args, context) => {
            try {
                const settingsService = new SettingsService(context.currentUser, context.language);
                return await settingsService.getCaptainPrivacyPolicy();
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        findSettings: async (root, args, context) => {
            try {
                const settingsService = new SettingsService(context.currentUser, context.language);
                return await settingsService.findSettings();
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        listSavedReplies: async (root, args, context) => {
            try {
                const savedRepliesService = new SavedRepliesService(context.user, context.currentUser, context.language);
                return await savedRepliesService.listSavedReplies();
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },

    },
    RootMutation: {
        updateClientTermsAndConditions: async (root, args, context) => {
            try {
                const termsAndConditions = args.termsAndConditions
                const settingsService = new SettingsService(context.currentUser, context.language);
                const res = await settingsService.updateClientTermsAndConditions(termsAndConditions);
                return {
                    status: true,
                    result: res,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        updateClientPrivacyPolicy: async (root, args, context) => {
            try {
                const privacyPolicy = args.privacyPolicy
                const settingsService = new SettingsService(context.currentUser, context.language);
                const res = await settingsService.updateClientPrivacyPolicy(privacyPolicy);
                return {
                    status: true,
                    result: res,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        updateChefTermsAndConditions: async (root, args, context) => {
            try {
                const termsAndConditions = args.termsAndConditions
                const settingsService = new SettingsService(context.currentUser, context.language);
                const res = await settingsService.updateChefTermsAndConditions(termsAndConditions);
                return {
                    status: true,
                    result: res,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        updateChefPrivacyPolicy: async (root, args, context) => {
            try {
                const privacyPolicy = args.privacyPolicy
                const settingsService = new SettingsService(context.currentUser, context.language);
                const res = await settingsService.updateChefPrivacyPolicy(privacyPolicy);
                return {
                    status: true,
                    result: res,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        updateCaptainTermsAndConditions: async (root, args, context) => {
            try {
                const termsAndConditions = args.termsAndConditions
                const settingsService = new SettingsService(context.currentUser, context.language);
                const res = await settingsService.updateCaptainTermsAndConditions(termsAndConditions);
                return {
                    status: true,
                    result: res,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        updateCaptainPrivacyPolicy: async (root, args, context) => {
            try {
                const privacyPolicy = args.privacyPolicy
                const settingsService = new SettingsService(context.currentUser, context.language);
                const res = await settingsService.updateCaptainPrivacyPolicy(privacyPolicy);
                return {
                    status: true,
                    result: res,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        updateSettings: async (root, args, context) => {
            try {
                const settingsService = new SettingsService(context.currentUser, context.language);
                const res = await settingsService.updateSettings(args.settingsInput);
                return {
                    status: true,
                    result: res,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        createSavedReply: async (root, args, context) => {
            try {
                const savedReply = args.savedReply
                const savedRepliesService = new SavedRepliesService(context.user, context.currentUser, context.language)
                const res = await savedRepliesService.createSavedReply(savedReply)
                return {
                    status: true,
                    result: res,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        editSavedReply: async (root, args, context) => {
            try {
                const savedReplyId = args.savedReplyId
                const savedReplyUpdate = args.savedReplyUpdate
                const savedRepliesService = new SavedRepliesService(context.user, context.currentUser, context.language)
                const res = await savedRepliesService.editSavedReply(savedReplyId, savedReplyUpdate)
                return {
                    status: true,
                    result: res,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        removeSavedReply: async (root, args, context) => {
            try {
                const savedReplyId = args.savedReplyId
                const savedRepliesService = new SavedRepliesService(context.user, context.currentUser, context.language)
                const res = await savedRepliesService.removeSavedReply(savedReplyId)
                return {
                    status: true,
                    result: res,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
    }
}

module.exports = resolvers;