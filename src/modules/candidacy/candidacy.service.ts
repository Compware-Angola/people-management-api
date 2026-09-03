import { Injectable } from '@nestjs/common';
import { CreateCandidacyDto } from './dto/create-candidacy.dto';
import { UpdateCandidacyDto } from './dto/update-candidacy.dto';

@Injectable()
export class CandidacyService {
  create(createCandidacyDto: CreateCandidacyDto) {
    return 'This action adds a new candidacy';
  }

  findAll() {
    return `This action returns all candidacy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} candidacy`;
  }

  update(id: number, updateCandidacyDto: UpdateCandidacyDto) {
    return `This action updates a #${id} candidacy`;
  }

  remove(id: number) {
    return `This action removes a #${id} candidacy`;
  }
}
