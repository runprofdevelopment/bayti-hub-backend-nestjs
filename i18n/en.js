const en = {
    notifications: {
        error: {
            wrongNotification: 'Notification not found.'
        }
    },
    address: {
        error: {
            addressNotFound: 'Address not found.'
        }
    },
    pagination: {
        errors: {
            errorPrevious: 'This is the first page.',
            missedDoc: 'Missed Document for the pagination.',

        }
    },
    constants: {
        error: {
            wrongComm: 'This is not valid commission.',
            wrongVat: 'This is not valid VAT.',
            invalidEmail: 'This email is not valid.',

        }
    },
    order: {
        error: {
            orderNotFound: 'Order not found.',
            orderNotAvailable: 'This order is not available',
            cannotCancelOrder: 'Cannot Cancel this order',
            cannotCloseOrder: 'Cannot close this order.',
            cannotReviewOrder: 'Cannot review the order before delivering it.',
            orderAmountBelowMin: 'Order amount less than the minimum order amount for this kitchen.',
            wrongStatus: 'Wrong status.',
            wrongQRCode: 'Wrong QR Code',
            alreadyReviewed: 'Order already reviewed',
            orderHasCaptain: "Order already assigned to captain"
        },
        notification: {
            checkoutChefTitle: 'New order',
            checkoutChefBody: 'New order received',
            // checkoutChefBody: 'Order created successfully',
            checkoutClientTitle: 'New Order',
            checkoutClientBody: 'Your order is being procedded.',
            captainReceivedOrderTitle: 'New Order',
            captainReceivedOrderBody: 'check new order no:',
            orderAssignedTitle: 'New Delivery',
            orderAssignedBody: 'New delivery order received',
            orderDeliveredChefTitle: 'Order Delivered',
            orderDeliveredChefBody: 'Order delivered successfully',
            orderInProgressTitle: 'Delivering Order',
            orderInProgressBody: 'The order on its way',
            orderDeliveredClientTitle: 'Order Delivered',
            orderDeliveredClientBody: 'Order delivered successfully',
            orderCanceledTitle: 'Order Cancelled',
            orderCanceledBody: 'Order Cancelled',
            orderDeliveringTitle: 'Get Ready!',
            orderDeliveringBody: 'Your order is out for delivery.',
            orderReminderTitle: 'Order reminder',
            orderReminderBody: 'Do not forget to prepare your order',
            orderDeliveredClientTile: "Rate Your Order",
            orderDeliveredClientBody: "We Hope you enjoyed your order from HomeFoods."
        }
    },
    cart: {
        error: {
            emptyCart: "Cart is Empty.",
            wrongQuantity: "Quantity must be positive number.",
            outOfArea: "This address is out of chef coverage area.",
            sizeNotFound: "Size not found",
            addonNotFound: "Addon not found"
        },
        notification: {

        }
    },
    promotion: {
        error: {
            cannotPromote: "Cannot create promotion right now.",
            promotionNotFound: "Promotion Not found.",
            wrongDate: "Wrong Date",
            overlapDate: "Date overlap between promotion"
        },
        notification: {

        }
    },
    promo: {
        error: {
            notPositiveDiscount: 'Discount must have positive value.',
            moreThanHundredDiscount: 'Discount value must be less than 100.',
            notPositiveMaxUses: 'Max number of uses must have positive value.',
            pastPromoCode: 'The start date of the promo code must be in the future.',
            endBeforeStart: 'Promo code end data must be after start date.',
            wrongPromo: 'This promo is wrong.',
            PromoNotAllowedForUser: 'This user cannot use this promo.'
        }
    },
    client: {
        error: {
            clientExists: 'This client is already exists.',
            bankAccountNotFound: 'This bank Account not found.',
            clientNotFound: 'Client not found.',
            higherAmountRequest: 'The requested amount is higher than the wallet balance.',
            removeWhileRunningAuctions: 'Cannot remove user while having running auctions.',
            noPermission: 'You don\'t have permission',
            clientHasOrders: 'This client has current orders'
        },
        notification: {
            welcome: 'Welcome to Home Foods!'
        }
    },
    admin: {
        error: {
            adminExists: 'This admin is already exists.',
            adminNotFound: 'Admin not found.',
        },
        notification: {
            welcome: 'Welcome to Home Foods!'
        }
    },
    chef: {
        error: {
            chefExists: 'This chef is already exists.',
            chefNotFound: 'Chef not found.',
            wrongState: 'Wrong state for chef.',
            bankAccountNotFound: 'Bank account not found.',
            higherAmountRequest: 'Amount requested higher than wallet amount',
            addressNotFound: 'Chef address not found',
            cannotAddMeal: 'You cannot add meals before completing your kitchen.',
            sectionNotFound: 'Section Not Found.',
            chefHasOrders: 'This chef has current orders',
            threeCatsMax: 'Maximum number of selected categories is 3.'
        },
        notification: {
            welcome: 'Congratulations! welcome with us on Home Food.'
        }
    },
    captain: {
        error: {
            captainExists: 'This captain is already exists.',
            captainNotFound: 'Captain not found.',
            wrongStatus: 'Cannot perform this action for this captain.',
            bankAccountNotFound: 'Bank account not found.',
            higherAmountRequest: 'Amount requested higher than wallet amount',
            cannotAssignOrder: 'Cannot assign order to this captain.',
            cannotRemoveCaptain: 'Cannot remove Captain',
            captainHashOrder: 'Captain already has assigned order.'
        },
        notification: {
            welcome: 'Congratulations! wlecome with us on Home Food.'
        }
    },
    meal: {
        error: {
            mealNotFound: 'Meal not found.',
            noSizes: 'One size at least must be added.'
        },
    },
    vehicle: {
        error: {
            vehicleNotFound: 'Vehicle not found.',
        },
    },
    wallet: {
        error: {
            walletNotFound: 'Wallet not found.',
            notSufficientAmount: 'There is not sufficient amount in the wallet.'
        },
        notification: {
            rechargeWalletTitle: 'Wallet recharged',
            rechargeWalletBody: 'You wallet recharged by us!'
        }
    },
    category: {
        error: {
            categoryNotFound: 'category not found.',
        }
    },
    request: {
        error: {
            requestNotFound: 'Request not found.',
            cannotDecideRequest: 'Cannot decide this withdraw request.',
            missedTimeStamp: 'Missed time stamp for money convertion.'
        },
        notification: {
            withdrawAcceptTitle: 'Withdraw accepted',
            withdrawAcceptBody: 'Your withdraw request accepted',
            withdrawRejectTitle: 'Withdraw rejected',
            withdrawRejectBody: 'Your withdraw request rejected',
            withdrawConfirmTitle: 'Withdraw confirmed',
            withdrawConfirmBody: 'Your withdraw request confirmed'
        }
    },
    errors: {
        validation: {
            invalidEmail: 'This email is invalid.',
            invalidPhoneNumber: 'This phone number is invalid.',
            shortPassword: 'Password must be at least 8 characters.',
            missedAddress: 'Address is missed.',
            missedlatlang: 'Latitude and longitude are missed.',
            invalidPhone: 'This phone number is not valid',
            cityNotFound: 'City not found.',
            addressNotFound: 'Address not found.'

        }
    }

}
module.exports = en