
const typeDefs = `

    scalar JSON

    scalar DateTime

    scalar Time

    scalar Date
    
    type AutocompleteOption {
        id: String!
        label: String!
    }

    input PaginationInput{
        limit: Int!
        doc: JSON
        action: ActionType!
        orderBy: String!
        sortType: SortType!
        firstPage: Boolean!
        offset: Int
    }

    enum ActionType{
        next
        prev
    } 

    enum SortType{
        asc
        desc
    } 

    enum Lang{
        en
        ar
    }

    type Name{
        en: String!
        ar: String!
    }

    input NameInput{
        en: String!
        ar: String!
    }

    input LocationInput{
        lat: Float!
        lng: Float!    
    }

    enum QueryOperator{
        less
        lessEqual
        greater
        greaterEqual
        equal
        notEqual
        startsWith
        in
        notIn
        arrayContains
        arrayContainsAny
    }
    
    input Filter{
        key: String!
        value: JSON
        values: [JSON]
        operator: QueryOperator!
    }

    type Address{
        id: String!
        name: String
        lat: Float!
        long: Float!
        street: String
        building: String
        notes: String
        isDefault: Boolean!
        isRemoved: Boolean!
        createdAt: DateTime
        updatedAt: DateTime
    }

    input AddressInput{
        lat: Float!
        long: Float!
        name: String
        street: String
        building: String
        notes: String
    }

    input AddressUpdate{
        name: String
        lat: Float
        long: Float
        cityId: String
        phoneNumber: String
        district: String
        street: String
        building: String
        notes: String
    }

    type City {
        id: String
        en: String
        ar: String
    }

    type Vehicle {
        id: String!
        name: Name!
    
        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type Notification {
        id: String!
        action: String
        body: Name!
        image: String
        isRead: Boolean!
        isRemoved: Boolean!
        title: Name!
        data: JSON
        userType: String
        type: String

        createdAt: DateTime
        createdBy: String
        updatedAt: DateTime
        updatedBy: String
    }

    type BankAccount{
        id: String!
        bankName: String!
        iban: String!
        fullName: String!
        isDefault: Boolean!
        idNumber: String!
    }
    
    input BankAccountInput{
        bankName: String!
        iban: String!
        fullName: String!
        idNumber: String!
    }

    input BankAccountUpdate{
        bankName: String
        iban: String
        fullName: String
        idNumber: String
    }

    type Transaction {
        id: String!
        type: TransactionTypeEnum!
        trackId: String
        amount: Float!
        objectType: String!
        objectId: String!
        objectNo: String
        payerType: UserTypeEnum!
        payerId: String!
        payeeType: UserTypeEnum!
        payeeId: String!
        status: TransactionStatusEnum!
        paymentMethod: PaymentMethodEnum!
        paymentId: String!
        notes: Name
        
        createdBy: String  
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
        code: String
    }

    enum TransactionTypeEnum{
        withdraw
        recharge
        order
        refund
        promotion
        rechargeByAdmin    
    }

    enum TransactionStatusEnum{
        pending
        fail
        success
    }

    enum PaymentMethodEnum{
        visa
        wallet
    }

    enum UserTypeEnum{
        client
        chef
        captain
        admin
        app
        external
    }

    type Request {
        id: String!
        type: String!
        description: String!
        amount: Float!
        transId: String
        ownerId: String!
        userType: UserTypeEnum!
        status: RequestStatusEnum!
        bankAccountId: String!
        bankAccount: BankAccount!
        transactionTimeStamp: DateTime
        transactionId: String
        transactionUrl: String
        notes: String
        
        chef: Chef
        captain: Captain
       
        createdBy: String!
        createdAt: DateTime!
        updatedBy: String!
        updatedAt: DateTime!
    }

    input RequestInput{
        type: RequestType!
        description: String!
        amount: Float!
        bankAccountId: String!
    }

    enum RequestStatusEnum {
        pending
        accepted
        rejected
        confirmed
    }

    enum RequestType {
        withdraw
    }

    type Category {
        id: String!
        name: Name!
        image: String
        order: Int!

        isRemoved: Boolean!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type Meal {
        id: String!
        name: Name!
        description: Name!
        categoryId: String!
        sectionId: String!
        price: Float!
        images: [String]!
        video: String

        category: Category
        section: Section!

        orderBefore: OrderBeforeEnum!

        addons: [Addon]!
        sizes: [MealSize]!

        chefId: String!

        isEnabled: Boolean!
        isRemoved: Boolean!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type MealSize{
        id: String!
        name: Name!
        price: Float!
    }

    type Captain {
        id: String!
        code: String!
        fullName: String
        phoneNumber: String!
        email: String
        avatar: String
        authenticationUid: String!
        deviceTokens: [String]!
        lang: Lang!

        vehicleId: String!
        vehicle: Vehicle!

        closedOrdersCount: Int!
        cancelledOrdersCount: Int!

        currentLat: Float!
        currentLng: Float!
        geohash: String
        city: City

        pendingOrderId: String
        pendingOrder: Order

        deliveringOrderId: String
        deliveringOrder: Order

        license: String
        vehicleLicense: String

        dashboardReview: DashboardReview

        isEnabled: Boolean!
        notification: Boolean!
        isRemoved: Boolean!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type Chef {
        id: String!
        code: String!
        fullName: String!
        phoneNumber: String!
        email: String
        authenticationUid: String!
        deviceTokens: [String]!
        lang: Lang!
        avatar: String
        
        rating: Float!
        reviewsCount: Int

        closedOrdersCount: Int!
        cancelledOrdersCount: Int!
        
        idCard: String
        freelanceCertificate: String
        taxNumber: String
        medicalCertificate: String

        dashboardReview: DashboardReview

        address: Address

        promoted: Boolean

        city: City

        sections: [Section]!
        kitchen: Kitchen

        mealsCount: Int
        sectionsCount:Int
        weeklyHours: Int

        notification: Boolean!
        isRemoved: Boolean!
        isEnabled: Boolean!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type Client {
        id: String!
        code: String!
        fullName: String
        phoneNumber: String!
        email: String
        avatar: String
        authenticationUid: String!
        deviceTokens: [String]!
        lang: Lang!

        defaultAddress: Address
        city: City

        closedOrdersCount: Int!
        cancelledOrdersCount: Int!

        dashboardReview: DashboardReview

        notification: Boolean!
        isRemoved: Boolean!
        isEnabled: Boolean!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type Kitchen{
        kitchenName: Name!
        logo: String
        cover: String
        minOrderAmount: Float!
        schedule: Schedule!
        timeZone: Int!
        categoriesIds: [String]!
        categories: [Category]!
    }

    type Schedule {
        saturday: DayShift!
        sunday: DayShift!
        monday: DayShift!
        tuesday: DayShift!
        wednesday: DayShift!
        thursday: DayShift!
        friday: DayShift!
    }

    type DayShift {
        working: Boolean!
        startTime: Time!
        endTime: Time!
    }

    type Section {
        id: String!
        name: Name!

        meals: [Meal]
    }

    input DashboardReviewInput{
        rating: Int!
        review: String
    }

    type DashboardReview {
        rating: Int!
        review: String
    }

    enum OrderBeforeEnum{
        immediate
        oneHour
        threeHours
        sixHours
        nineHours
        twelveHours
        day
        twoDays
        threeDays
    }

    type Addon{
        id: String!
        name: Name!
        price: Float!
    }

    type CartAddon{
        addon: Addon!
        quantity: Int!
    }

    type Cart {
        id: String!
        chefId: String
        items: [CartItem]!

        minOrderAmount: Float!
        itemsCount: Int!
        chefName: Name
        
        value: Float!
        deliveryFeesAmount: Float
        total_vat_price: Float
        total_price: Float

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type CartItem {
        id: String!
        chefId: String!
        mealId: String!
        sizeId: String
        quantity: Int!
        addons: [SelectedAddon]!

        meal: Meal!
        size: MealSize!
        addonsItems: [CartAddon]!
        value: Float!
    }

    type SelectedAddon{
        id: String!
        quantity: Int!
    }
    
    type Order {
        id: String!
        orderNo: String
        QRCode: String!
        
        clientId: String!
        client: Client

        chefId: String!
        chef: Chef!

        captainId: String
        captain: Captain

        addressId: String!
        address: Address!
        cityId: String!

        notes: String

        cart: Cart!
        cartAmount: Float!
        deliveryFees: Float!
        totalAmount: Float!
        chefProfit: Float!
        appOrderProfit: Float!
        appDeliveryProfit: Float!
        appTotalProfit: Float!
        captainProfit: Float!
        taxes: Float!

        status: OrderStatus
        paymentMethod: PaymentMethodEnum

        deliveryTime: DateTime!
        pickUpTime: DateTime!

        chefReview: ChefReview
        reviewed: Boolean!
        
        createdBy: String
        createdAt: DateTime!
        updatedBy: String
        updatedAt: DateTime
    }

    enum OrderStatus{
        shadow
        inProgress
        delivering
        closed
        cancelled
    }

    type ChefReview {
        id: String!
        orderId: String!
        clientId: String!
        chefId: String!
        clientName: String!
        rating: Int!
        review: String!
        
        createdBy: String
        createdAt: DateTime!
        updatedBy: String
        updatedAt: DateTime
    }
`

module.exports = typeDefs