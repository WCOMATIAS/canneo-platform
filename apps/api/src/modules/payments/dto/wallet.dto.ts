import { ApiProperty } from '@nestjs/swagger';

export class WalletBalanceResponseDto {
  @ApiProperty({ description: 'ID da wallet' })
  id: string;

  @ApiProperty({ description: 'Tipo do proprietário', example: 'DOCTOR' })
  ownerType: string;

  @ApiProperty({ description: 'ID do proprietário' })
  ownerId: string | null;

  @ApiProperty({ description: 'Moeda', example: 'BRL' })
  currency: string;

  @ApiProperty({ description: 'Saldo total em centavos' })
  balanceTotal: number;

  @ApiProperty({ description: 'Saldo pendente (em janela antifraude) em centavos' })
  balancePending: number;

  @ApiProperty({ description: 'Saldo disponível para saque em centavos' })
  balanceAvailable: number;

  @ApiProperty({ description: 'Saldo em hold (bloqueado) em centavos' })
  balanceOnHold: number;

  @ApiProperty({ description: 'Total já sacado em centavos' })
  balanceWithdrawn: number;
}

export class WalletStatementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  direction: string;

  @ApiProperty()
  amountCents: number;

  @ApiProperty()
  entryType: string;

  @ApiProperty()
  referenceType: string;

  @ApiProperty()
  referenceId: string;

  @ApiProperty()
  createdAt: Date;
}
