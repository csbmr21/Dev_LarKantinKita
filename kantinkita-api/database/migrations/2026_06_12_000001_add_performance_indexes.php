<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add performance indexes to frequently queried columns.
 * These indexes support common query patterns in:
 * - Order listing/filtering by status, tenant, user
 * - Menu listing by tenant
 * - Report date-range queries
 * - User/tenant lookups by company_code
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->index('status', 'idx_orders_status');
            $table->index('tenant_id', 'idx_orders_tenant_id');
            $table->index('user_id', 'idx_orders_user_id');
            $table->index('created_at', 'idx_orders_created_at');
            $table->index(['tenant_id', 'status'], 'idx_orders_tenant_status');
            $table->index(['user_id', 'status'], 'idx_orders_user_status');
            $table->index(['status', 'expires_at'], 'idx_orders_status_expires');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id', 'idx_order_items_order_id');
            $table->index('menu_id', 'idx_order_items_menu_id');
        });

        Schema::table('menus', function (Blueprint $table) {
            $table->index('tenant_id', 'idx_menus_tenant_id');
            $table->index('category_id', 'idx_menus_category_id');
            $table->index('is_available', 'idx_menus_is_available');
            $table->index(['tenant_id', 'is_available'], 'idx_menus_tenant_available');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->index('tenant_id', 'idx_categories_tenant_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('role_id', 'idx_users_role_id');
            $table->index('company_code', 'idx_users_company_code');
            $table->index('role', 'idx_users_role');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->index('company_code', 'idx_tenants_company_code');
            $table->index(['status', 'is_deleted'], 'idx_tenants_status_deleted');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->index('tenant_id', 'idx_subscriptions_tenant_id');
            $table->index('status', 'idx_subscriptions_status');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index('user_id', 'idx_activity_logs_user_id');
            $table->index('created_at', 'idx_activity_logs_created_at');
        });

        Schema::table('error_logs', function (Blueprint $table) {
            $table->index('resolved_status', 'idx_error_logs_resolved_status');
            $table->index('created_at', 'idx_error_logs_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_status');
            $table->dropIndex('idx_orders_tenant_id');
            $table->dropIndex('idx_orders_user_id');
            $table->dropIndex('idx_orders_created_at');
            $table->dropIndex('idx_orders_tenant_status');
            $table->dropIndex('idx_orders_user_status');
            $table->dropIndex('idx_orders_status_expires');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order_id');
            $table->dropIndex('idx_order_items_menu_id');
        });

        Schema::table('menus', function (Blueprint $table) {
            $table->dropIndex('idx_menus_tenant_id');
            $table->dropIndex('idx_menus_category_id');
            $table->dropIndex('idx_menus_is_available');
            $table->dropIndex('idx_menus_tenant_available');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('idx_categories_tenant_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role_id');
            $table->dropIndex('idx_users_company_code');
            $table->dropIndex('idx_users_role');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropIndex('idx_tenants_company_code');
            $table->dropIndex('idx_tenants_status_deleted');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex('idx_subscriptions_tenant_id');
            $table->dropIndex('idx_subscriptions_status');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('idx_activity_logs_user_id');
            $table->dropIndex('idx_activity_logs_created_at');
        });

        Schema::table('error_logs', function (Blueprint $table) {
            $table->dropIndex('idx_error_logs_resolved_status');
            $table->dropIndex('idx_error_logs_created_at');
        });
    }
};
