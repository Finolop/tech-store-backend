Вот полный, структурированный список всех эндпоинтов твоего бэкенда на текущий момент (включая только что добавленный модуль заказов). 

Можешь скопировать этот блок и передать фронтендеру или вставить в свой файл спецификации `API_SPECIFICATION.md`.

---

# ARCSHOP REST API — Полная документация эндпоинтов

* **Базовый URL:** `http://localhost:5000/api/v1`
* **Формат данных:** `JSON`
* **Авторизация:** Заголовок `Authorization: Bearer <accessToken>`
* **Refresh Token:** Управляется автоматически через `httpOnly` Cookie

---

## 1. Авторизация и профиль (`/auth`)

| Метод | URL | Доступ | Описание |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Публичный | Регистрация нового покупателя |
| `POST` | `/auth/login` | Публичный | Вход (по email или номеру телефона) |
| `POST` | `/auth/refresh` | По Cookie | Обновление пары токенов (access/refresh) |
| `POST` | `/auth/logout` | Авторизован / Cookie | Выход из текущей сессии (очистка cookie) |
| `POST` | `/auth/logout-all` | Bearer Token | Сброс всех активных сессий пользователя |
| `GET` | `/auth/me` | Bearer Token | Получение данных текущего пользователя |

<details>
<summary>Примеры тела запросов (Auth)</summary>

**POST `/auth/register`**
```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "email": "ivan@example.com",
  "phone": "+79991234567",
  "password": "strongPassword123"
}
```

**POST `/auth/login`**
```json
{
  "login": "ivan@example.com", 
  "password": "strongPassword123"
}
```
*(В поле `login` можно передавать как email, так и телефон)*
</details>

---

## 2. Категории и Баннеры (Главная и Сайдбар)

| Метод | URL | Доступ | Описание |
| :--- | :--- | :--- | :--- |
| `GET` | `/categories` | Публичный | Список всех категорий для сайдбара (с иконками) |
| `GET` | `/banners` | Публичный | Список активных баннеров для слайдера |

<details>
<summary>Пример ответа GET /categories</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Смартфоны",
      "slug": "smartphones",
      "icon": "smartphone"
    }
  ]
}
```
</details>

---

## 3. Каталог товаров (`/products`)

| Метод | URL | Доступ | Описание |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Публичный | Каталог с пагинацией, поиском и фильтрами |
| `GET` | `/products/:slug` | Публичный | Детальная страница товара по его slug |

**Параметры строки запроса (Query Params) для `GET /products`:**
* `category` *(строка)*: фильтр по категории, например `?category=laptops`
* `search` *(строка)*: поиск по названию/описанию, например `?search=macbook`
* `page` *(число, default: 1)*: номер страницы
* `limit` *(число, default: 12)*: элементов на страницу
* `sort` *(строка)*: сортировка: `price_asc` (дешевле), `price_desc` (дороже), `newest` (новые)

<details>
<summary>Пример ответа GET /products</summary>

```json
{
  "success": true,
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 12,
    "totalPages": 4
  },
  "data": [
    {
      "id": "prod-uuid",
      "title": "MacBook Air M2",
      "slug": "macbook-air-m2",
      "price": 115000.00,
      "oldPrice": 125000.00,
      "stock": 8,
      "images": ["https://..."],
      "category": {
        "id": "cat-uuid",
        "name": "Ноутбуки",
        "slug": "laptops"
      }
    }
  ]
}
```
</details>

---

## 4. Корзина (`/cart`)

*Все эндпоинты требуют заголовок `Authorization: Bearer <accessToken>`*

| Метод | URL | Описание |
| :--- | :--- | :--- |
| `GET` | `/cart` | Получить корзину пользователя (с подсчетом итоговой цены) |
| `POST` | `/cart` | Добавить товар в корзину (или увеличить кол-во) |
| `PATCH` | `/cart/:itemId` | Изменить количество конкретной позиции |
| `DELETE` | `/cart/:itemId` | Удалить позицию из корзины |

<details>
<summary>Примеры запросов и ответов (Cart)</summary>

**POST `/cart`**
```json
{
  "productId": "prod-uuid-1",
  "quantity": 2
}
```

**PATCH `/cart/:itemId`**
```json
{
  "quantity": 3
}
```

**Пример ответа GET `/cart`:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cart-item-uuid",
        "quantity": 2,
        "product": {
          "id": "prod-uuid-1",
          "title": "MacBook Air M2",
          "slug": "macbook-air-m2",
          "price": 115000,
          "images": ["..."],
          "stock": 8
        },
        "subtotal": 230000
      }
    ],
    "totalCount": 2,
    "totalPrice": 230000
  }
}
```
</details>

---

## 5. Избранное (`/favorites`)

*Все эндпоинты требуют заголовок `Authorization: Bearer <accessToken>`*

| Метод | URL | Описание |
| :--- | :--- | :--- |
| `GET` | `/favorites` | Получить список всех избранных товаров |
| `POST` | `/favorites/toggle` | Добавить/удалить товар из избранного (переключатель) |

<details>
<summary>Пример работы POST /favorites/toggle</summary>

**Тело запроса:**
```json
{
  "productId": "prod-uuid-1"
}
```

**Ответ (если добавили):**
```json
{
  "success": true,
  "isFavorite": true,
  "message": "Товар добавлен в избранное"
}
```
*(При повторном вызове вернет `"isFavorite": false` и удалит товар из базы)*
</details>

---

## 6. Заказы (`/orders`)

*Все эндпоинты требуют заголовок `Authorization: Bearer <accessToken>`*

| Метод | URL | Описание |
| :--- | :--- | :--- |
| `POST` | `/orders` | **Оформить заказ из корзины** (с проверкой и списанием остатков) |
| `GET` | `/orders` | История всех заказов текущего пользователя |
| `GET` | `/orders/:id` | Детальная информация по конкретному заказу |
| `PATCH` | `/orders/:id/cancel` | Отменить заказ (возвращает товары обратно на склад) |

<details>
<summary>Примеры запросов и ответов (Orders)</summary>

**POST `/orders` (Оформление заказа):**
```json
{
  "deliveryAddress": "г. Москва, ул. Ленина, д. 10, кв. 42",
  "contactPhone": "+79991234567",
  "comment": "Позвонить за час до доставки"
}
```

**Ответ (201 Created):**
```json
{
  "success": true,
  "message": "Заказ успешно оформлен",
  "data": {
    "id": "order-uuid-1",
    "userId": "user-uuid-1",
    "status": "PENDING",
    "totalAmount": "230000.00",
    "deliveryAddress": "г. Москва, ул. Ленина, д. 10, кв. 42",
    "contactPhone": "+79991234567",
    "comment": "Позвонить за час до доставки",
    "createdAt": "2026-03-31T12:00:00.000Z",
    "items": [
      {
        "id": "item-uuid",
        "productId": "prod-uuid-1",
        "price": "115000.00",
        "quantity": 2,
        "product": {
          "id": "prod-uuid-1",
          "title": "MacBook Air M2",
          "slug": "macbook-air-m2",
          "images": ["..."]
        }
      }
    ]
  }
}
```

**Возможные статусы заказа (`status`):**
* `PENDING` — оформлен, ожидает оплаты/обработки
* `PAID` — оплачен
* `SHIPPED` — передан курьеру/в доставку
* `DELIVERED` — доставлен покупателю
* `CANCELLED` — отменен
</details>

---

## 7. Системные

| Метод | URL | Описание |
| :--- | :--- | :--- |
| `GET` | `/health` | Проверка жизнеспособности сервера (`status: ok`) |