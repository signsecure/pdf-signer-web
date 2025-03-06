import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { z } from "zod";

export const certificateRouter = createTRPCRouter({
  isCertificatePresent: protectedProcedure.query(async ({ ctx }) => {
    const certificate = await db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        certificate: true,
      },
    });
    console.log(certificate?.certificate, "certificate");

    if (certificate?.certificate == null) {
      return {
        isPresent: false,
      };
    }
    return {
      isPresent: true,
    };
  }),
  registerCertificate: protectedProcedure
    .input(z.object({ certificate: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          certificate: input.certificate,
        },
      });
    }),
  getCertificateRegistered: protectedProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input }) => {
      const certificate = await db.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          certificate: true,
        },
      });

      if (certificate?.certificate == null) {
        return {
          isPresent: false,
        };
      }
      return {
        isPresent: true,
        certificate: certificate.certificate ,
      };
    }),
});
