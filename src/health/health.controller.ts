import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, DNSHealthIndicator, HealthCheck, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('health')
export class HealthController {

    constructor(
        private health: HealthCheckService,
        private dns: DNSHealthIndicator,
        private db: TypeOrmHealthIndicator,
        private configService: ConfigService
    ) {}

    @Get()
    @HealthCheck()
    @ApiOperation({description: 'Check the health of the service'})
    @ApiTags('Healthcheck')
    check() {

        let dnsCheckUrl = this.configService.get<string>('healthcheck.dnsUrl')

        return this.health.check([
            async () => this.dns.pingCheck('dnscheck', dnsCheckUrl),
            async () => this.db.pingCheck('database', { timeout: 300 }),
        ]);
    }

}
