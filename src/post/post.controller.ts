import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { CreatePostDto } from './dto';
import { PostService } from './post.service';

@UseGuards(JwtGuard)
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Get('/:id')
  getPost(@Param('id') id: number) {
    // the +id is to cast the id as number
    return this.postService.getPost(+id);
  }

  @Get()
  getAllPostsForUser(@GetUser() user: User) {
    return this.postService.getAllPostsForUser(user.id);
  }

  @Post()
  createPost(@GetUser() user: User, @Body() dto: CreatePostDto) {
    const addedId = { ...dto, userId: user.id };

    return this.postService.createPost(addedId);
  }

  @Put('/:id')
  updatePost(
    @GetUser() user: User,
    @Param('id') postId: number,
    @Body() dto: CreatePostDto,
  ) {
    const addedId = { ...dto, userId: user.id };

    return this.postService.updatePost(+postId, addedId);
  }

  @Delete('/:id')
  deletePost(@GetUser() user: User, @Param('id') postId: number) {
    return this.postService.deletePost(+postId, user);
  }
}
