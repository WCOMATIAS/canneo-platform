import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../../../common/constants/auth.constants';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const AdminOnly = () => Roles(UserRole.ADMIN);

export const DoctorOnly = () => Roles(UserRole.DOCTOR);

export const PatientOnly = () => Roles(UserRole.PATIENT);

export const PharmacyOnly = () => Roles(UserRole.PHARMACY);

export const OperationsOnly = () => Roles(UserRole.OPERATIONS);

export const AdminOrOperations = () => Roles(UserRole.ADMIN, UserRole.OPERATIONS);

export const DoctorOrAdmin = () => Roles(UserRole.DOCTOR, UserRole.ADMIN);

export const PatientOrAdmin = () => Roles(UserRole.PATIENT, UserRole.ADMIN);

export const PharmacyOrAdmin = () => Roles(UserRole.PHARMACY, UserRole.ADMIN);
