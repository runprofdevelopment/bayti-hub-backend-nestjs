const SliderService = require('../../service/sliderService')
const sharedResolvers = require('../sharedResolvers')
const PermissionService = require('../../service/permissionService')

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listSliders: async (parent, args, context) => {
            const sliderService = new SliderService(context.currentUser, context.language);
            return await sliderService.getSliders();
        },
        findSliderById:  async (parent, args, context) => {
            const sliderId = args.sliderId

            const sliderService = new SliderService(context.currentUser, context.language);
            return await sliderService.findSliderById(sliderId);
        },
    },
    RootMutation: {
        addSlider: async (root, args, context) => {
            try {
                const sliderInput = args.sliderInput

                const sliderService = new SliderService(context.currentUser, context.language);
                const slider = await sliderService.addSlider(sliderInput);
                return {
                    status: true,
                    result: slider,
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
        removeSlider: async (root, args, context) => {
            try {
                const sliderId = args.sliderId
              
                const sliderService = new SliderService(context.currentUser, context.language);
                const result = await sliderService.removeSlider(sliderId);
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
        updateSlider: async (root, args, context) => {
            try {
                const sliderId = args.sliderId
                const sliderUpdate = args.sliderUpdate
              
                const sliderService = new SliderService(context.currentUser, context.language);
                const result = await sliderService.updateSlider(sliderId, sliderUpdate);
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