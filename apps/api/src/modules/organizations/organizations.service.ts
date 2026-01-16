import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipRole } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { plan: true },
        },
        _count: {
          select: {
            memberships: true,
            patients: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organização não encontrada');
    }

    return organization;
  }

  async update(id: string, data: { name?: string; logo?: string; settings?: any }) {
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async getMembers(organizationId: string) {
    return this.prisma.membership.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            avatarUrl: true,
            lastLoginAt: true,
            doctorProfile: {
              select: {
                crm: true,
                ufCrm: true,
                specialty: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async inviteMember(
    organizationId: string,
    email: string,
    role: MembershipRole,
    invitedBy: string,
  ) {
    // Verifica se usuário existe
    let user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Cria usuário pendente (sem senha)
      user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: email.split('@')[0],
          passwordHash: '', // Será definido quando aceitar convite
          emailVerified: false,
        },
      });
    }

    // Verifica se já é membro
    const existingMembership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (existingMembership) {
      throw new ForbiddenException('Usuário já é membro desta organização');
    }

    // Cria membership
    const membership = await this.prisma.membership.create({
      data: {
        userId: user.id,
        organizationId,
        role,
        invitedAt: new Date(),
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // TODO: Enviar email de convite

    return membership;
  }

  async updateMemberRole(
    organizationId: string,
    memberId: string,
    role: MembershipRole,
    requesterId: string,
  ) {
    // Não pode alterar próprio role
    const membership = await this.prisma.membership.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.organizationId !== organizationId) {
      throw new NotFoundException('Membro não encontrado');
    }

    if (membership.userId === requesterId) {
      throw new ForbiddenException('Você não pode alterar seu próprio cargo');
    }

    // Não pode rebaixar OWNER
    if (membership.role === 'OWNER') {
      throw new ForbiddenException('Não é possível alterar o cargo do proprietário');
    }

    return this.prisma.membership.update({
      where: { id: memberId },
      data: { role },
    });
  }

  async removeMember(organizationId: string, memberId: string, requesterId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.organizationId !== organizationId) {
      throw new NotFoundException('Membro não encontrado');
    }

    if (membership.userId === requesterId) {
      throw new ForbiddenException('Você não pode remover a si mesmo');
    }

    if (membership.role === 'OWNER') {
      throw new ForbiddenException('Não é possível remover o proprietário');
    }

    return this.prisma.membership.update({
      where: { id: memberId },
      data: { isActive: false },
    });
  }
}
