import {
	Controller,
	UseGuards,
	Post,
	Body,
	Delete,
	Param,
	Get,
	Query
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CrudController } from '../core/crud/crud.controller';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../shared/guards/auth/role.guard';
import { Roles } from '../shared/decorators/roles';
import { RolesEnum, ICandidatePersonalQualities } from '@gauzy/models';
import { CandidatePersonalQualities } from './candidate-personal-qualities.entity';
import { CandidatePersonalQualitiesService } from './candidate-personal-qualities.service';
import {
	CandidatePersonalQualitiesBulkCreateCommand,
	CandidatePersonalQualitiesBulkDeleteCommand
} from './commands';
import { CommandBus } from '@nestjs/cqrs';
import { ParseJsonPipe } from '../shared';

@ApiTags('CandidatePersonalQuality')
@UseGuards(AuthGuard('jwt'))
@Controller()
export class CandidatePersonalQualitiesController extends CrudController<
	CandidatePersonalQualities
> {
	constructor(
		private readonly candidatePersonalQualitiesService: CandidatePersonalQualitiesService,
		private commandBus: CommandBus
	) {
		super(candidatePersonalQualitiesService);
	}

	@UseGuards(RoleGuard)
	@Roles(RolesEnum.CANDIDATE, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
	@Post()
	async addPersonalQuality(
		@Body() entity: CandidatePersonalQualities
	): Promise<any> {
		return this.candidatePersonalQualitiesService.create(entity);
	}

	@UseGuards(RoleGuard)
	@Roles(RolesEnum.CANDIDATE, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
	@Delete(':id')
	deletePersonalQuality(@Param() id: string): Promise<any> {
		return this.candidatePersonalQualitiesService.delete(id);
	}

	@UseGuards(RoleGuard)
	@Roles(RolesEnum.CANDIDATE, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
	@Post('createBulk')
	async createBulk(
		@Body() input: any
	): Promise<ICandidatePersonalQualities[]> {
		const { interviewId = null, personalQualities = [] } = input;
		return this.commandBus.execute(
			new CandidatePersonalQualitiesBulkCreateCommand(
				interviewId,
				personalQualities
			)
		);
	}

	@UseGuards(RoleGuard)
	@Roles(RolesEnum.CANDIDATE, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
	@Get('getByInterviewId/:interviewId')
	async findByInterviewId(
		@Param('interviewId') interviewId: string
	): Promise<ICandidatePersonalQualities[]> {
		return this.candidatePersonalQualitiesService.getPersonalQualitiesByInterviewId(
			interviewId
		);
	}

	@UseGuards(RoleGuard)
	@Roles(RolesEnum.CANDIDATE, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
	@Delete('deleteBulk/:id')
	async deleteBulk(
		@Param() id: string,
		@Query('data', ParseJsonPipe) data: any
	): Promise<any> {
		const { personalQualities = null } = data;
		return this.commandBus.execute(
			new CandidatePersonalQualitiesBulkDeleteCommand(
				id,
				personalQualities
			)
		);
	}
}
