import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common';
import { PRODUCT_SERVICE } from 'src/config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy,
  ) {}

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsClient.send(
      { cmd: 'create_product' },
      createProductDto,
    );
  }

  @Get()
  findAllProducts(@Query() paginationDto: PaginationDto) {
    return this.productsClient.send(
      { cmd: 'find_all_products' },
      paginationDto,
    );
  }
  @Get(':id')
  async findProductById(@Param('id') id: string) {
    try {
      const product = await firstValueFrom(
        this.productsClient.send({ cmd: 'find_one_product' }, { id: id }),
      );
      return product;
    } catch (error) {
      throw new RpcException(error);
    }
  }
  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    try {
      const product = this.productsClient.send(
        { cmd: 'delete_product' },
        { id: id },
      );
      return product;
    } catch (error) {
      throw new RpcException(error);
    }
  }
  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const updatedProduct = this.productsClient.send(
        { cmd: 'update_product' },
        { id, ...updateProductDto },
      );
      return updatedProduct;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
