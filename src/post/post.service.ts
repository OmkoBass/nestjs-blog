import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async getPost(id: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: id,
      },
      include: {
        // Include the owners email and age
        createdBy: {
          select: {
            email: true,
            age: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with id:${id} not found.`);
    }

    return post;
  }

  async getAllPostsForUser(userId: number) {
    const posts = await this.prisma.post.findMany({
      where: {
        userId,
      },
    });

    return posts;
  }

  async createPost(dto: CreatePostDto) {
    try {
      const post = await this.prisma.post.create({
        data: {
          title: dto.title,
          content: dto.content,
          userId: dto.userId,
        },
      });

      return post;
    } catch (error) {
      throw error;
    }
  }

  async updatePost(postId: number, dto: CreatePostDto) {
    const post = await this.getPost(postId);

    if (post.userId !== dto.userId) {
      throw new ForbiddenException("You don't have permissions to do that.");
    }

    try {
      const updatePost = await this.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          title: dto.title,
          content: dto.content,
        },
      });

      return updatePost;
    } catch (error) {
      throw error;
    }
  }

  async deletePost(postId: number, dto: User) {
    const post = await this.getPost(postId);

    if (post.userId !== dto.id) {
      throw new ForbiddenException("You don't have permissions to do that.");
    }

    try {
      const deletePost = await this.prisma.post.delete({
        where: {
          id: postId,
        },
      });

      return deletePost;
    } catch (error) {
      throw error;
    }
  }
}
