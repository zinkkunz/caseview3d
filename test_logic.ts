// Simple test script for plan limits
import { canCreateLink } from './lib/plan-limits';
import { prisma } from '@/lib/prisma';

async function test() {
    console.log("Testing Plan Limits Logic...");

    // Create a dummy user behaving like the Production Admin (ADMIN Plan, Expired Date)
    const testId = "test-check-admin";
    
    // Clean up first
    try { await prisma.user.delete({ where: { id: testId } }); } catch {}

    await prisma.user.create({
        data: {
            id: testId,
            email: "test_check@example.com",
            plan: "ADMIN",
            planEndDate: new Date("2020-01-01"), // PAST DATE
            role: "USER" // Even if role is USER, plan ADMIN should pass
        }
    });

    const result = await canCreateLink(testId);
    console.log("Result for Expired ADMIN Plan:", result);

    if (result.allowed === true) {
        console.log("SUCCESS: Expired ADMIN plan is ALLOWED.");
    } else {
        console.error("FAILURE: Expired ADMIN plan was BLOCKED. Reason:", result.reason);
    }
    
    await prisma.user.delete({ where: { id: testId } });
}

test()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
