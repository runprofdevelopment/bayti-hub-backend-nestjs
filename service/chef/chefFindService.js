const ChefRepository = require('../../database/chefRepository');
const CategoryFindService = require('../category/categoryFindService');
const CustomError = require('../../error/customeError');
const SubCollectionRepository = require('../../database/subCollectionRepository');

module.exports = class ChefFindService {
    constructor(currentUser, language) {
        this.currentUser = currentUser
        this.language = language
        this.chefRepository = new ChefRepository();
        this.categoryFindService = new CategoryFindService(null, this.currentUser, this.language);
        this.mealsRepository = new SubCollectionRepository("chefs", "meals");
    }

    async findChefByAuthId(authenticationUid) {
        const filter = [
            { key: 'authenticationUid', operator: '==', value: authenticationUid },
            { key: 'isRemoved', operator: '==', value: false },
        ]
        const pagination = {
            action: "next",
            firstPage: true,
            limit: 10,
            orderBy: "createdBy",
            sortType: "asc"
        }

        const chefs = await this.listChefs(filter, pagination);

        if (chefs.length === 0) {
            throw new CustomError(this.language, 'chef.error.chefNotFound');
        }

        return chefs[0];
    }

    async findChefByIdNotRemoved(chefId) {
        try {
            const chef = await this.findChefById(chefId);
            if (chef.isRemoved) {
                throw new CustomError(this.language, 'chef.error.chefNotFound');
            }

            return chef;
        } catch (error) {
            throw error;
        }
    }

    async findChefById(chefId) {
        try {
            const chef = await this.chefRepository.findChefById(chefId);
            if (!chef) {
                return null;
            }

            if (chef.kitchen) {
                const categoriesIds = chef.kitchen.categoriesIds;
                const promises = categoriesIds.map(categoryId => this.categoryFindService.findCategoryById(categoryId));
                const categories = await Promise.all(promises);
                const filteredCategories = categories.filter(category => category && !category.isRemoved);

                chef.kitchen.categories = filteredCategories;

                const chefMeals = await this.mealsRepository.listDocuments(chef.id, [
                    { key: 'isRemoved', operator: '==', value: false }
                ], null);
                chef.mealsCount = chefMeals.length;
                chef.sectionsCount = chef.sections.length;
                chef.weeklyHours = this.calculateWeeklyHours(chef.kitchen.schedule);
            } else {
                chef.mealsCount = 0;
                chef.sectionsCount = 0;
                chef.weeklyHours = 0;
            }

            return chef;
        } catch (error) {
            throw error;
        }
    }

    async isChefFoundByAuthId(authenticationUid) {
        try {
            const chef = await this.findChefByAuthId(authenticationUid);

            return chef !== null;
        } catch (error) {
            return false;
        }
    }

    async listChefsNotRemoved(filter, pagination) {
        try {
            const appendedFilters = [
                { key: 'isRemoved', operator: '==', value: false },
                ...filter
            ]
            return await this.listChefs(appendedFilters, pagination);
        } catch (error) {
            throw error
        }
    }

    async listChefs(filter, pagination) {
        try {
            const chefs = await this.chefRepository.getChefs(filter, pagination);
            for (const chef of chefs) {
                if (chef.kitchen) {
                    const categoriesIds = chef.kitchen.categoriesIds;
                    const promises = categoriesIds.map(categoryId => this.categoryFindService.findCategoryById(categoryId));
                    const categories = await Promise.all(promises);
                    const filteredCategories = categories.filter(category => category && !category.isRemoved);

                    chef.kitchen.categories = filteredCategories;

                    const chefMeals = await this.mealsRepository.listDocuments(chef.id, [
                        { key: 'isRemoved', operator: '==', value: false }
                    ], null);
                    chef.mealsCount = chefMeals.length;
                    chef.sectionsCount = chef.sections.length;
                    chef.weeklyHours = this.calculateWeeklyHours(chef.kitchen.schedule);
                    if (chef.sections) {
                        chef.sections = this.mapSectionsToMeals(chef.sections, chefMeals);
                    }
                } else {
                    chef.mealsCount = 0;
                    chef.sectionsCount = 0;
                    chef.weeklyHours = 0;
                }
            }

            return chefs;
        } catch (error) {
            throw error;
        }
    }

    calculateWeeklyHours(schedule) {
        console.log("Start of the time");
        if (!schedule) {
            return 0;
        }
        let weeklyHours = 0;
        for (const day in schedule) {
            const daySchedule = schedule[day];
            if (daySchedule.working === true) {

                const startMinute = Number(daySchedule.startTime.split(":")[0]) * 60 + Number(daySchedule.startTime.split(":")[1]);
                const endMinutes = Number(daySchedule.endTime.split(":")[0]) * 60 + Number(daySchedule.endTime.split(":")[1]);
                console.log(startMinute + " "+ endMinutes);
                if (startMinute < endMinutes) {
                    weeklyHours = weeklyHours + Math.round((endMinutes - startMinute) / 60);
                } else {
                    weeklyHours = weeklyHours + Math.round((startMinute + (1440 - endMinutes)) / 60);
                }
                console.log(weeklyHours);
            }
        }

        return weeklyHours;
    }

    mapSectionsToMeals(sections, meals) {
        const sectionMealsMap = new Map();

        for (const section of sections) {
            sectionMealsMap.set(section.id, []);
        }

        for (const meal of meals) {
            if (sectionMealsMap.has(meal.sectionId)) {
                sectionMealsMap.get(meal.sectionId).push(meal);
            }
        }

        for (const section of sections) {
            section.meals = sectionMealsMap.get(section.id);
        }

        return sections;
    }

}