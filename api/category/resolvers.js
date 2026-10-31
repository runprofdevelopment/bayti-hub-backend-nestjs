const CategoryCreateService = require('../../service/category/cetegoryCreateService')
const CategoryFindService = require('../../service/category/categoryFindService')
const CategoryEditService = require('../../service/category/categoryEditService')
const CategoryRemoveService = require('../../service/category/categoryRemoveService')

const sharedResolvers = require('../sharedResolvers')

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listCategories: async (parent, args, context) => {
            const categoryFindService = new CategoryFindService(context.user, context.currentUser, context.language);
            return await categoryFindService.listCategories(args.filter, args.pagination);
        },
        listAllCategories: async (parent, args, context) => {
            const categoryFindService = new CategoryFindService(context.user, context.currentUser, context.language);
            return await categoryFindService.listAllCategories();
        },
        findCategoryById: async (parent, args, context) => {
            const categoryId = args.categoryId
            const categoryFindService = new CategoryFindService(context.user, context.currentUser, context.language);
            return await categoryFindService.findCategoryById(categoryId)
        },
    },
    RootMutation: {
        createCategory: async (root, args, context) => {
            try {
                const name = args.name
                const categoryCreateService = new CategoryCreateService(context.user, context.currentUser, context.language);
                const category = await categoryCreateService.createCategory(name)
                return {
                    status: true,
                    result: category,
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

        }, removeCategory: async (root, args, context) => {
            try {
                const categoryId = args.categoryId
                const categoryRemoveService = new CategoryRemoveService(context.user, context.currentUser, context.language);
                const result = await categoryRemoveService.removeCategory(categoryId)
                return {
                    status: true,
                    result: result,
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

        }, editCategory: async (root, args, context) => {
            try {
                const categoryId = args.categoryId
                const categoryUpdate = args.categoryUpdate

                const categoryEditService = new CategoryEditService(context.user, context.currentUser, context.language);
                const result = await categoryEditService.editCategory(categoryId, categoryUpdate)
                return {
                    status: true,
                    result: result,
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

        }, arrangeCategories: async (root, args, context) => {
            try {
                const categoriesIds = args.categoriesIds
                const categoryEditService = new CategoryEditService(context.user, context.currentUser, context.language);
                const result = await categoryEditService.arrangeCategories(categoriesIds);
                return {
                    status: true,
                    result: result,
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