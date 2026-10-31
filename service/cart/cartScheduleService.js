const admin = require('firebase-admin');
const SubCollectionService = require('../../database/subCollectionRepository');
const MealFindService = require('../meal/mealFindService');
const ClientFindService = require('../client/clientFindService');
const CartFindService = require('./cartFindService');
const ChefFindService = require('../chef/chefFindService');
const SettingService = require("../settingsService");
const CustomError = require('../../error/customeError');

module.exports = class CartScheduleService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.cartRepository = new SubCollectionService("clients", "carts");
        this.mealFindService = new MealFindService(this.currentUser, this.language);
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        this.cartFindService = new CartFindService(this.currentUser, this.language);
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.settingsService = new SettingService(this.currentUser, this.language);
    }

    async findCartSchedule(authId) {
        try {
            const settings = await this.settingsService.findSettings();
            const deliveryTime = settings.deliveryTime ? settings.deliveryTime : 30;

            const client = await this.clientFindService.findClientByAuthId(authId);
            const cart = await this.cartFindService.findDetailedCartByAuthId(authId);
            if (!cart.chefId) {
                throw new CustomError(this.language, 'cart.error.emptyCart');
            }
            const chef = await this.chefFindService.findChefByIdNotRemoved(cart.chefId);
            const schedule = chef.kitchen.schedule;
            const timeZone = chef.kitchen.timeZone ? chef.kitchen.timeZone : 0;

            const days = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];
            const scheduleArray = days.map(day => schedule[day]);

            const minHours = await this.getMinTimeForCart(cart);
            // get index of current day with saturday is 0
            const currentDate = new Date();
            const currentDay = (currentDate.getDay() + 1) % 7;

            // get index of least order day with saturday is 0
            const leastDate = new Date();
            leastDate.setTime(leastDate.getTime() + (minHours * 60 * 60 * 1000) + (deliveryTime * 60 * 1000));
            const leastDay = (leastDate.getDay() + 1) % 7;

            // switch off days before the least data
            for (let i = currentDay; i !== leastDay; i = (i + 1) % 7) {
                scheduleArray[i].working = false;
            }

            // Handle if least hour inside current working day
            if (scheduleArray[leastDay].working) {
                const startHour = Number(scheduleArray[leastDay].startTime.split(":")[0]);
                const endHour = Number(scheduleArray[leastDay].endTime.split(":")[0]);

                const min = new Date(leastDate.getTime());
                const max = new Date(leastDate.getTime());
                if (startHour > endHour) {
                    min.setDate(leastDate.getDate() - 1);
                }

                min.setHours(startHour);
                min.setMinutes(Number(scheduleArray[leastDay].startTime.split(":")[1]));

                max.setHours(endHour);
                max.setMinutes(Number(scheduleArray[leastDay].endTime.split(":")[1]));

                if (leastDate.getTime() > max.getTime()) {
                    scheduleArray[leastDay].working = false;
                } else if (leastDate.getTime() > min.getTime()) {
                    scheduleArray[leastDay].startTime = `${leastDate.getHours()}:${leastDate.getMinutes().toString()}:00`
                }
            }
            for (let i = 0; i < currentDay; i++) {
                scheduleArray.push(scheduleArray.shift());
            }

            return scheduleArray;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getMinTimeForCart(cart) {
        try {
            let minHours = 0;

            const items = cart.items;
            for (const item of items) {
                const meal = await this.mealFindService.findMealById(cart.chefId, item.mealId);
                // get the needed hours for preparing this meal
                const mealPreparingHours = this.mapOrderBeforeToHours(meal.orderBefore);
                minHours = Math.max(minHours, mealPreparingHours);
            }

            return minHours;
        } catch (error) {
            throw error;
        }
    }

    mapOrderBeforeToHours(orderBefore) {
        try {
            switch (orderBefore) {
                case "immediate": return 0;
                case "oneHour": return 1;
                case "threeHours": return 3;
                case "sixHours": return 6;
                case "nineHours": return 9;
                case "twelveHours": return 12;
                case "day": return 24;
                case "twoDays": return 48;
                case "threeDays": return 72;
            }
            return 0;
        } catch (error) {
            throw error;
        }
    }

}