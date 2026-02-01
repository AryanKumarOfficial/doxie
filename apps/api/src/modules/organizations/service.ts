import { prisma, Role } from '@doxie/db';
import { AppError } from '../../common/errors';
import { ServiceResponse } from '../../common/response';

export class OrganizationService {
  async createOrganization(userId: string, name: string, slug: string) {
    const existingOrg = await prisma.organization.findUnique({ where: { slug } });
    if (existingOrg) {
      throw new AppError('Organization slug already exists', 400);
    }

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId,
            role: 'ORG_OWNER',
          },
        },
      },
    });

    return ServiceResponse.success('Organization created', org);
  }

  async getMyOrganizations(userId: string) {
    const memberships = await prisma.member.findMany({
      where: { userId },
      include: { organization: true },
    });
    return ServiceResponse.success('Organizations retrieved', memberships);
  }

  async addMember(requesterId: string, organizationId: string, email: string, role: Role) {
    // Verify requester has permission (Owner or Admin)
    const requesterMembership = await prisma.member.findUnique({
       where: {
           userId_organizationId: {
               userId: requesterId,
               organizationId
           }
       }
    });

    if (!requesterMembership || (requesterMembership.role !== 'ORG_OWNER' && requesterMembership.role !== 'ADMIN')) {
        throw new AppError('Insufficient permissions', 403);
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
        throw new AppError('User not found', 404);
    }

    const existingMember = await prisma.member.findUnique({
        where: {
            userId_organizationId: {
                userId: userToAdd.id,
                organizationId
            }
        }
    });

    if (existingMember) {
         throw new AppError('User is already a member', 400);
    }

    const member = await prisma.member.create({
        data: {
            userId: userToAdd.id,
            organizationId,
            role
        }
    });

    return ServiceResponse.success('Member added', member);
  }
}
