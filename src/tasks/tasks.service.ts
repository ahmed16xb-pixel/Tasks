import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from 'src/schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(createTaskDto: CreateTaskDto) {
    let taskCreated: TaskDocument | null = null;

    try {
      taskCreated = await this.taskModel.create(createTaskDto);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to create task',
      );
    }

    if (!taskCreated) {
      throw new InternalServerErrorException('Task not created');
    }

    return taskCreated;
  }

  async findAll() {
    const taskDocuments = await this.taskModel.find();

    if (taskDocuments.length === 0) {
      throw new NotFoundException('No tasks in the database!');
    }

    return taskDocuments;
  }

  async findOne(id: string) {
    const taskDocument = await this.taskModel.findById(new Types.ObjectId(id));

    if (!taskDocument) {
      throw new NotFoundException(`Task with id: ${id} not found`);
    }

    return taskDocument;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const updatedTask = await this.taskModel.findByIdAndUpdate(
      id,
      updateTaskDto,
      { new: true },
    );

    if (!updatedTask) {
      throw new NotFoundException(`Task with id: ${id} not found`);
    }

    return updatedTask;
  }

  async remove(id: string) {
    const deletedTask = await this.taskModel.findByIdAndDelete(id).exec();

    if (!deletedTask) {
      throw new NotFoundException(`Task with id: ${id} not found`);
    }

    return deletedTask;
  }
}
