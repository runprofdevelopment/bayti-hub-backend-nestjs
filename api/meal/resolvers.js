const MealCreateService = require('../../service/meal/mealCreateService');
const MealEditService = require('../../service/meal/mealEditService');
const MealFindService = require('../../service/meal/mealFindService');
const MealRemoveService = require('../../service/meal/mealRemoveService');

const sharedResolvers = require('../sharedResolvers');

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listChefMeals: async (parent, args, context) => {
            const mealFindService = new MealFindService(context.currentUser, context.language);
            return await mealFindService.listChefMealsById(args.chefId, args.filter, args.pagination);
        },
        findMeal: async (parent, args, context) => {
            const mealFindService = new MealFindService(context.currentUser, context.language);
            return await mealFindService.findMealById(args.chefId, args.mealId);
        },
        myMeals: async (parent, args, context) => {
            const mealFindService = new MealFindService(context.currentUser, context.language);
            return await mealFindService.listChefMealsByAuthId(context.currentUser.uid, args.filter, args.pagination);
        },
    },
    RootMutation: {
        createMeal: async (root, args, context) => {
            try {
                const mealCreateService = new MealCreateService(context.currentUser, context.language);
                const meal = await mealCreateService.createMeal(args.mealInput);
                return {
                    status: true,
                    result: meal,
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
        editMyMeal: async (root, args, context) => {
            try {
                const mealEditService = new MealEditService(context.currentUser, context.language);
                const response = await mealEditService.editMealByChefAuthId(context.currentUser.uid, args.mealId, args.mealUpdate);
                return {
                    status: true,
                    result: response,
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
        editMeal: async (root, args, context) => {
            try {
                const mealEditService = new MealEditService(context.currentUser, context.language);
                const response = await mealEditService.editMealByChefId(args.chefId, args.mealId, args.mealUpdate);
                return {
                    status: true,
                    result: response,
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
        removeMyMeal: async (root, args, context) => {
            try {
                const mealRemoveService = new MealRemoveService(context.currentUser, context.language);
                const response = await mealRemoveService.removeMealByAuthId(context.currentUser.uid, args.mealId);
                return {
                    status: true,
                    result: response,
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
        removeMeal: async (root, args, context) => {
            try {
                const mealRemoveService = new MealRemoveService(context.currentUser, context.language);
                const response = await mealRemoveService.removeMealByChefId(args.chefId, args.mealId);
                return {
                    status: true,
                    result: response,
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

module.exports = resolvers