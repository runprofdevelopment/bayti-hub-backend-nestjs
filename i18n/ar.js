const ar = {
    notifications: {
        error: {
            wrongNotification: 'هذا الاشعار غير موجود.'
        }
    },
    address: {
        error: {
            addressNotFound: 'العنوان غير موجود.'
        }
    },
    pagination: {
        errors: {
            errorPrevious: 'هذه الصفحة الأولى.',
            missedDoc: 'المستند مفقود.',

        }
    },
    constants: {
        error: {
            wrongComm: 'نسبة عمولة خاطئة.',
            wrongVat: 'ضريبة قيمة مضافة خاطئة.',
            invalidEmail: 'بريد الكترونى غير صحيح.',
        }
    },
    order: {
        error: {
            orderNotFound: 'الطلب غير موجود.',
            orderNotAvailable: 'هذا الطلب غير متاح الان.',
            cannotCancelOrder: 'لا يمكن الغاء هذا الطلب.',
            cannotCloseOrder: 'لا يمكن اغلاق هذا الطلب.',
            cannotReviewOrder: 'لا يمكن تقييم الطلب قبل توصيله.',
            orderAmountBelowMin: 'قيمة الطلب أقل من الحد الأدنى للطلب من هذا المطبخ.',
            wrongStatus: 'حالة طلب خطأ.',
            wrongQRCode: 'كود خطأ.',
            alreadyReviewed: 'تم مراجعة الطلب من قبل.',
            orderHasCaptain: "الطلب تم تعيينه لكابتن اخر بالفعل"

        },
        notification: {
            checkoutChefTitle: 'طلب جديد',
            checkoutChefBody: 'تم استلام طلب جديد',
            // checkoutChefBody: 'تم تنفيذ الطلب بنجاح',
            checkoutClientTitle: 'طلب جديد.',
            checkoutClientBody: 'طلبك قيد التنفيذ',
            captainReceivedOrderTitle: 'طلب جديد',
            captainReceivedOrderBody: 'تفقد الطلب الجديد رقم:',
            orderAssignedTitle: 'طلب توصيل جديد',
            orderAssignedBody: 'تم استلام طلب توصيل جديد',
            captainReceivedOrderBody: 'طلب التوصيل رقم: ',
            orderDeliveredChefTitle: 'تم توصيل الطلب',
            orderInProgressTitle: 'الطلب في الطريق',
            orderInProgressBody: 'جاري توصيل الطلب',
            orderDeliveredChefBody: 'تم توصيل الطلب بنجاح',
            orderDeliveredClientTitle: 'تم توصيل الطلب',
            orderDeliveredClientBody: 'تم توصيل الطلب بنجاح',
            orderCanceledTitle: 'تم الغاء الطلب',
            orderCanceledBody: 'تم الغاء الطلب',
            orderDeliveringTitle: 'كن مستعد!',
            orderDeliveringBody: 'طلبك خرج للتوصيل.',
            orderReminderTitle: 'تذكير بطلباتك',
            orderReminderBody: 'لا تنس اعداد الوجبات المطلوبة فى موعدها',
            orderDeliveredClientTile: "قيم الطلب الخاص بك",
            orderDeliveredClientBody: "نتمني آن تكون قد آستمتعت بطلبك من هوم فودز."
        }
    },
    cart: {
        error: {
            emptyCart: "سلة الشراء فارغة.",
            wrongQuantity: "الكمية يجب ان تكون قيمة موجبة.",
            outOfArea: "هذا العنوان خارج تغطية الشيف.",
            sizeNotFound: "الحجم غير موجود",
            addonNotFound: "الاضافة غير موجودة"
        },
        notification: {

        }
    },
    promotion: {
        error: {
            cannotPromote: "لا يمكن تنفيذ عملية ترويج الان.",
            promotionNotFound: "الترويج غير موجود.",
            wrongDate: "تاريخ خطأ",
            overlapDate: "يوجد تداخل فى تواريخ الترويج."
        },
        notification: {

        }
    },
    client: {
        error: {
            clientExists: 'هذا المستخدم موجود بالفعل.',
            bankAccountNotFound: 'هذا الحساب البنكى غير موجود.',
            clientNotFound: 'المستخدم غير موجود',
            higherAmountRequest: 'المبلغ المطلوب أكبر من المبلغ المتاح فى المحفظة.',
            removeWhileRunningAuctions: 'لا يمكن ازالة المستخدم و لديه مزادات لم تنتهى بعد',
            noPermission: 'ليس لديك الصلاحية.',
            clientHasOrders: 'هذا العميل لديه طلبات جارية'
        },
        notification: {
            welcome: 'مرحباً بك فى هوم فودز'
        }
    },
    admin: {
        error: {
            adminExists: 'هذا المستخدم موجود بالفعل.',
            adminNotFound: 'هذا المسئول غير موجود.',
        },
        notification: {
            welcome: 'مرحباً بك فى هوم فودز'
        }
    },
    chef: {
        error: {
            chefExists: 'هذا الشيف موجود بالفعل.',
            chefNotFound: 'هذا الشيف غير موجود.',
            wrongState: 'حالة خطأ للشيف.',
            bankAccountNotFound: 'الحساب البنكى غير موجود.',
            higherAmountRequest: 'المبلغ المطلوب أكبر من المبلغ المتاح بالمحفظة.',
            addressNotFound: 'عنوان الطباخ غير موجود.',
            cannotAddMeal: 'لا يمكن اضافة وجبات قبل اتمام المطبخ أولاً.',
            sectionNotFound: 'التصنيف الداخلى غير موجود.',
            chefHasOrders: 'الشيف لديه طلبات تحت التنفيذ',
            threeCatsMax: 'الحد الآقصي لعدد التصنيفات هو ٣'
        },
        notification: {
            welcome: 'تهانينيا! مرحباً بك معنا فى هوم فود.'
        }
    },
    captain: {
        error: {
            captainExists: 'هذا الكابتن موجود بالفعل.',
            captainNotFound: 'هذا الكابتن غير موجود.',
            wrongStatus: 'لا يمكن تنفيذ هذا الأمر لهذا الكابتن.',
            bankAccountNotFound: 'الحساب البنكى غير موجود.',
            higherAmountRequest: 'المبلغ المطلوب أكبر من المبلغ المتاح بالمحفظة.',
            cannotAssignOrder: 'لا يمكن تحويل الطلب لهذا الكابتن.',
            cannotRemoveCaptain: 'لا يمكن حذف هذا الكابتن.',
            captainHashOrder: 'الكابتن لديه طلب بالفعل'
        },
        notification: {
            welcome: 'تهانينيا! مرحباً بك معنا فى هوم فود.'
        }
    },
    meal: {
        error: {
            mealNotFound: 'الوجبة غير موجودة.',
            noSizes: 'يجب اضافة حجم واحد للوجبة على الاقل.'
        },
    },
    vehicle: {
        error: {
            vehicleNotFound: 'نوع السيارة غير موجود',
        },
    },
    wallet: {
        error: {
            walletNotFound: 'هذه المحفظة غير موجودة.',
            notSufficientAmount: 'لا يوجد مقدار كافى من المال لاتمام العملية.'
        },
        notification: {
            rechargeWalletTitle: 'شحن المحفظة',
            rechargeWalletBody: 'قمنا بشحن محفظتك'
        }
    },
    category: {
        error: {
            categoryNotFound: 'الفئة غير موجودة.',
        }
    },
    request: {
        error: {
            requestNotFound: 'الطلب غير موجود.',
            cannotDecideRequest: 'لا يمكن قبول أو رفض هذا الطلب الان.',
            missedTimeStamp: 'موعد تحويل الاموال غير موجود.'
        },
        notification: {
            withdrawAcceptTitle: 'قبول طلب السحب',
            withdrawAcceptBody: 'تم قبول طلب السحب الخاص بك.',
            withdrawRejectTitle: 'رفض طلب السحب',
            withdrawRejectBody: 'تم رفض طلب السحب الخاص بك',
            withdrawConfirmTitle: 'تأكيد طلب السحب',
            withdrawConfirmBody: 'تم تأكيد التحويل الخاص بطلب السحب.'
        }
    },
    errors: {
        validation: {
            invalidEmail: 'هذا البريد الالكترونى غير صحيح.',
            invalidPhoneNumber: 'رقم الهاتف غير صحيح.',
            shortPassword: 'كلمة السر يجب ألا يقل طولها عن 8 حروف.',
            missedAddress: 'لا يوجد عنوان.',
            missedlatlang: 'لا يوجد احداثيات للعنوان.',
            invalidPhone: 'رقم الهاتف غير صحيح.',
            cityNotFound: 'المدينة غير موجودة.',
            addressNotFound: 'العنوان غير موجود.'
        }
    }

}

module.exports = ar