"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var typeorm_1 = require("typeorm");
var User = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('users')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _password_hash_decorators;
    var _password_hash_initializers = [];
    var _password_hash_extraInitializers = [];
    var _full_name_decorators;
    var _full_name_initializers = [];
    var _full_name_extraInitializers = [];
    var _username_decorators;
    var _username_initializers = [];
    var _username_extraInitializers = [];
    var _avatar_url_decorators;
    var _avatar_url_initializers = [];
    var _avatar_url_extraInitializers = [];
    var _bio_decorators;
    var _bio_initializers = [];
    var _bio_extraInitializers = [];
    var _role_decorators;
    var _role_initializers = [];
    var _role_extraInitializers = [];
    var _last_login_decorators;
    var _last_login_initializers = [];
    var _last_login_extraInitializers = [];
    var _created_at_decorators;
    var _created_at_initializers = [];
    var _created_at_extraInitializers = [];
    var _updated_at_decorators;
    var _updated_at_initializers = [];
    var _updated_at_extraInitializers = [];
    var _deleted_at_decorators;
    var _deleted_at_initializers = [];
    var _deleted_at_extraInitializers = [];
    var _is_verified_decorators;
    var _is_verified_initializers = [];
    var _is_verified_extraInitializers = [];
    var _verification_code_decorators;
    var _verification_code_initializers = [];
    var _verification_code_extraInitializers = [];
    var User = _classThis = /** @class */ (function () {
        function User_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.email = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _email_initializers, void 0));
            this.password_hash = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _password_hash_initializers, void 0));
            this.full_name = (__runInitializers(this, _password_hash_extraInitializers), __runInitializers(this, _full_name_initializers, void 0));
            this.username = (__runInitializers(this, _full_name_extraInitializers), __runInitializers(this, _username_initializers, void 0));
            this.avatar_url = (__runInitializers(this, _username_extraInitializers), __runInitializers(this, _avatar_url_initializers, void 0));
            this.bio = (__runInitializers(this, _avatar_url_extraInitializers), __runInitializers(this, _bio_initializers, void 0));
            this.role = (__runInitializers(this, _bio_extraInitializers), __runInitializers(this, _role_initializers, void 0));
            this.last_login = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _last_login_initializers, void 0));
            this.created_at = (__runInitializers(this, _last_login_extraInitializers), __runInitializers(this, _created_at_initializers, void 0));
            this.updated_at = (__runInitializers(this, _created_at_extraInitializers), __runInitializers(this, _updated_at_initializers, void 0));
            this.deleted_at = (__runInitializers(this, _updated_at_extraInitializers), __runInitializers(this, _deleted_at_initializers, void 0));
            this.is_verified = (__runInitializers(this, _deleted_at_extraInitializers), __runInitializers(this, _is_verified_initializers, void 0));
            this.verification_code = (__runInitializers(this, _is_verified_extraInitializers), __runInitializers(this, _verification_code_initializers, void 0));
            __runInitializers(this, _verification_code_extraInitializers);
        }
        return User_1;
    }());
    __setFunctionName(_classThis, "User");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _email_decorators = [(0, typeorm_1.Column)({ unique: true })];
        _password_hash_decorators = [(0, typeorm_1.Column)()];
        _full_name_decorators = [(0, typeorm_1.Column)()];
        _username_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _avatar_url_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _bio_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _role_decorators = [(0, typeorm_1.Column)({ default: 'traveler' })];
        _last_login_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _created_at_decorators = [(0, typeorm_1.Column)({ default: function () { return 'CURRENT_TIMESTAMP'; } })];
        _updated_at_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _deleted_at_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _is_verified_decorators = [(0, typeorm_1.Column)({ type: 'boolean', default: false })];
        _verification_code_decorators = [(0, typeorm_1.Column)({ type: 'varchar', nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
        __esDecorate(null, null, _password_hash_decorators, { kind: "field", name: "password_hash", static: false, private: false, access: { has: function (obj) { return "password_hash" in obj; }, get: function (obj) { return obj.password_hash; }, set: function (obj, value) { obj.password_hash = value; } }, metadata: _metadata }, _password_hash_initializers, _password_hash_extraInitializers);
        __esDecorate(null, null, _full_name_decorators, { kind: "field", name: "full_name", static: false, private: false, access: { has: function (obj) { return "full_name" in obj; }, get: function (obj) { return obj.full_name; }, set: function (obj, value) { obj.full_name = value; } }, metadata: _metadata }, _full_name_initializers, _full_name_extraInitializers);
        __esDecorate(null, null, _username_decorators, { kind: "field", name: "username", static: false, private: false, access: { has: function (obj) { return "username" in obj; }, get: function (obj) { return obj.username; }, set: function (obj, value) { obj.username = value; } }, metadata: _metadata }, _username_initializers, _username_extraInitializers);
        __esDecorate(null, null, _avatar_url_decorators, { kind: "field", name: "avatar_url", static: false, private: false, access: { has: function (obj) { return "avatar_url" in obj; }, get: function (obj) { return obj.avatar_url; }, set: function (obj, value) { obj.avatar_url = value; } }, metadata: _metadata }, _avatar_url_initializers, _avatar_url_extraInitializers);
        __esDecorate(null, null, _bio_decorators, { kind: "field", name: "bio", static: false, private: false, access: { has: function (obj) { return "bio" in obj; }, get: function (obj) { return obj.bio; }, set: function (obj, value) { obj.bio = value; } }, metadata: _metadata }, _bio_initializers, _bio_extraInitializers);
        __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: function (obj) { return "role" in obj; }, get: function (obj) { return obj.role; }, set: function (obj, value) { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
        __esDecorate(null, null, _last_login_decorators, { kind: "field", name: "last_login", static: false, private: false, access: { has: function (obj) { return "last_login" in obj; }, get: function (obj) { return obj.last_login; }, set: function (obj, value) { obj.last_login = value; } }, metadata: _metadata }, _last_login_initializers, _last_login_extraInitializers);
        __esDecorate(null, null, _created_at_decorators, { kind: "field", name: "created_at", static: false, private: false, access: { has: function (obj) { return "created_at" in obj; }, get: function (obj) { return obj.created_at; }, set: function (obj, value) { obj.created_at = value; } }, metadata: _metadata }, _created_at_initializers, _created_at_extraInitializers);
        __esDecorate(null, null, _updated_at_decorators, { kind: "field", name: "updated_at", static: false, private: false, access: { has: function (obj) { return "updated_at" in obj; }, get: function (obj) { return obj.updated_at; }, set: function (obj, value) { obj.updated_at = value; } }, metadata: _metadata }, _updated_at_initializers, _updated_at_extraInitializers);
        __esDecorate(null, null, _deleted_at_decorators, { kind: "field", name: "deleted_at", static: false, private: false, access: { has: function (obj) { return "deleted_at" in obj; }, get: function (obj) { return obj.deleted_at; }, set: function (obj, value) { obj.deleted_at = value; } }, metadata: _metadata }, _deleted_at_initializers, _deleted_at_extraInitializers);
        __esDecorate(null, null, _is_verified_decorators, { kind: "field", name: "is_verified", static: false, private: false, access: { has: function (obj) { return "is_verified" in obj; }, get: function (obj) { return obj.is_verified; }, set: function (obj, value) { obj.is_verified = value; } }, metadata: _metadata }, _is_verified_initializers, _is_verified_extraInitializers);
        __esDecorate(null, null, _verification_code_decorators, { kind: "field", name: "verification_code", static: false, private: false, access: { has: function (obj) { return "verification_code" in obj; }, get: function (obj) { return obj.verification_code; }, set: function (obj, value) { obj.verification_code = value; } }, metadata: _metadata }, _verification_code_initializers, _verification_code_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        User = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return User = _classThis;
}();
exports.User = User;
