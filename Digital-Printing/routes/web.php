<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\DesignController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserLogController;

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::get('/register', [AuthController::class, 'showRegister']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');


/*
|--------------------------------------------------------------------------
| Products & Categories (Public)
|--------------------------------------------------------------------------
*/

Route::get('/', [ProductController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);


/*
|--------------------------------------------------------------------------
| Cart (Customer)
|--------------------------------------------------------------------------
*/

Route::get('/cart', [CartController::class, 'index']);

Route::post('/cart/add', [CartController::class, 'add']);
Route::post('/cart/update/{cartItem}', [CartController::class, 'update']);
Route::delete('/cart/remove/{cartItem}', [CartController::class, 'remove']);


/*
|--------------------------------------------------------------------------
| Orders
|--------------------------------------------------------------------------
*/

Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

Route::post('/checkout', [OrderController::class, 'checkout']);

Route::post('/orders/{order}/complete', [OrderController::class, 'confirmCompleted']);


/*
|--------------------------------------------------------------------------
| Payment
|--------------------------------------------------------------------------
*/

Route::get('/payment/methods', [PaymentController::class, 'methods']);

Route::post('/payment/{order}/upload', [PaymentController::class, 'uploadProof']);

Route::post('/payment/verify/{payment}', [PaymentController::class, 'verify']);


/*
|--------------------------------------------------------------------------
| Design Review
|--------------------------------------------------------------------------
*/

Route::post('/design/review/{order}', [DesignController::class, 'review']);

Route::post('/design/revision/{review}', [DesignController::class, 'requestRevision']);

Route::post('/design/upload/{review}', [DesignController::class, 'uploadRevision']);

Route::post('/design/approve/{review}', [DesignController::class, 'approve']);


/*
|--------------------------------------------------------------------------
| Production
|--------------------------------------------------------------------------
*/

Route::post('/production/start/{order}', [ProductionController::class, 'start']);

Route::post('/production/update/{log}', [ProductionController::class, 'updateStatus']);

Route::post('/production/finish/{order}', [ProductionController::class, 'finish']);


/*
|--------------------------------------------------------------------------
| Material Management
|--------------------------------------------------------------------------
*/

Route::get('/materials', [MaterialController::class, 'index']);

Route::post('/materials/store', [MaterialController::class, 'store']);

Route::put('/materials/{material}', [MaterialController::class, 'update']);

Route::post('/materials/restock/{material}', [MaterialController::class, 'restock']);

Route::get('/materials/history/{material}', [MaterialController::class, 'history']);


/*
|--------------------------------------------------------------------------
| Reports (Manager / Owner)
|--------------------------------------------------------------------------
*/

Route::get('/reports/sales', [ReportController::class, 'sales']);

Route::get('/reports/orders', [ReportController::class, 'orders']);

Route::get('/reports/production', [ReportController::class, 'production']);


/*
|--------------------------------------------------------------------------
| User Logs (Security Monitoring)
|--------------------------------------------------------------------------
*/

Route::get('/logs/login-history', [UserLogController::class, 'loginHistory']);

Route::get('/logs/activity', [UserLogController::class, 'activity']);

Route::get('/logs/audit', [UserLogController::class, 'audit']);