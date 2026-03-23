# Redis Learning API

Monorepo Bun + Turborepo tối giản để học Redis với NestJS.

## Cấu trúc

- `apps/redis`: ứng dụng NestJS API được tạo bằng Nest CLI.

## Lệnh dùng nhanh

Chạy ở thư mục `nestjs-bun`:

```sh
bun run dev --filter=redis
bun run build --filter=redis
bun run lint --filter=redis
bun run check-types --filter=redis
```

Hoặc chạy trực tiếp trong app:

```sh
cd apps/redis
bun run start:dev
```

## Bước tiếp theo để học Redis

1. Cài Redis cục bộ hoặc dùng Docker.
2. Thêm package như `ioredis` hoặc `@nestjs/cache-manager`.
3. Tạo module riêng cho kết nối Redis và thử các case như cache, queue, rate limit, pub/sub.
