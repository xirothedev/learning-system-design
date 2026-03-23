import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import type {
  CachedUserResponse,
  CreateSessionBody,
  DeleteSessionResponse,
  RateLimitResponse,
  SessionResponse,
  ShowcaseListResponse,
} from './app.type';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getShowcases(): ShowcaseListResponse {
    return this.appService.getShowcases();
  }

  @Get('cache/users/:id')
  getCachedUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CachedUserResponse> {
    return this.appService.getCachedUser(id);
  }

  @Post('rate-limit/:actorId')
  checkRateLimit(
    @Param('actorId') actorId: string,
  ): Promise<RateLimitResponse> {
    return this.appService.checkRateLimit(actorId);
  }

  @Post('sessions/:sessionId')
  createSession(
    @Param('sessionId') sessionId: string,
    @Body() payload: CreateSessionBody,
  ): Promise<SessionResponse> {
    return this.appService.createSession(sessionId, payload);
  }

  @Get('sessions/:sessionId')
  getSession(@Param('sessionId') sessionId: string): Promise<SessionResponse> {
    return this.appService.getSession(sessionId);
  }

  @Delete('sessions/:sessionId')
  deleteSession(
    @Param('sessionId') sessionId: string,
  ): Promise<DeleteSessionResponse> {
    return this.appService.deleteSession(sessionId);
  }
}
