export const denialMockData = [
    {
        id: 1,
        denialId: 'DNL-0456',
        priority: 'high',
        patient: { name: 'John Doe', mrn: '12345' },
        serviceDate: '2024-02-15',
        denialDate: '2024-03-01',
        payer: 'UnitedHealthcare',
        payerContact: {
            phone: '1-800-123-4567',
            email: 'appeals@unitedhealthcare.com'
        },
        denialReason: 'CO-22: Missing modifier',
        denialCategory: 'Technical',
        rootCause: 'Coder failed to append modifier -25 to CPT 99213.',
        amount: 1200,
        daysLeft: 10,
        status: 'Drafting Appeal',
        linkedAppealId: 'APL-1001',
        appealManager: 'Maria Garcia',
        appealDocumentation: [
            { label: 'Corrected Claim File', link: '#' },
            { label: 'Medical Records', link: '#' },
            { label: 'Payer Policy Reference', link: '#' }
        ],
        payerPolicyReference: 'https://unitedhealthcare.com/modifier-policy',
        denialTrends: '3 similar denials this month (CO-22: Missing modifier)',
        escalationPath: [
            { step: 'Internal Appeal', deadline: '2024-03-06' },
            { step: 'External Appeal', deadline: '2024-04-01' }
        ],
        auditTrail: [
            { timestamp: '2024-03-01 10:00', action: 'Denial Received by System' },
            { timestamp: '2024-03-01 14:30', action: 'Initial Review by Jane Smith' },
            { timestamp: '2024-03-02 09:15', action: 'Documentation Requested by Dr. Johnson (CPT 99213)' },
            { timestamp: '2024-03-03 11:00', action: 'Priority Updated to High by Maria Garcia' }
        ]
    },
    {
        id: 2,
        denialId: 'DNL-0789',
        priority: 'high',
        patient: { name: 'John Doe', mrn: '12345' },
        serviceDate: '2024-02-18',
        denialDate: '2024-03-02',
        payer: 'UnitedHealthcare',
        payerContact: {
            phone: '1-800-123-4567',
            email: 'appeals@unitedhealthcare.com'
        },
        denialReason: 'CO-16: Claim lacks information',
        denialCategory: 'Administrative',
        rootCause: 'Missing patient demographic information.',
        amount: 2500,
        daysLeft: 11,
        status: 'Under Review',
        linkedAppealId: 'APL-1002',
        appealManager: 'Jane Smith',
        appealDocumentation: [
            { label: 'Corrected Claim File', link: '#' },
            { label: 'Patient Demographics', link: '#' }
        ],
        payerPolicyReference: 'https://unitedhealthcare.com/claim-requirements',
        denialTrends: '2 similar denials this month (CO-16: Claim lacks information)',
        escalationPath: [
            { step: 'Internal Appeal', deadline: '2024-03-06' },
            { step: 'External Appeal', deadline: '2024-04-01' }
        ],
        auditTrail: [
            { timestamp: '2024-03-02 10:00', action: 'Denial Received by System' },
            { timestamp: '2024-03-02 14:30', action: 'Initial Review by Jane Smith' },
            { timestamp: '2024-03-03 09:15', action: 'Documentation Requested by Dr. Johnson' }
        ]
    },
    {
        id: 3,
        denialId: 'DNL-0234',
        priority: 'medium',
        patient: { name: 'Sarah Johnson', mrn: '12346' },
        serviceDate: '2024-02-20',
        denialDate: '2024-03-03',
        payer: 'Aetna',
        payerContact: {
            phone: '1-800-555-1234',
            email: 'appeals@aetna.com'
        },
        denialReason: 'CO-50: Non-covered service',
        denialCategory: 'Clinical',
        rootCause: 'Service not covered under patient\'s plan.',
        amount: 3500,
        daysLeft: 15,
        status: 'Appeal Ready',
        linkedAppealId: null,
        appealManager: 'John Carter',
        appealDocumentation: [
            { label: 'Medical Records', link: '#' },
            { label: 'Payer Policy Reference', link: '#' }
        ],
        payerPolicyReference: 'https://aetna.com/non-covered-services',
        denialTrends: '1 similar denial this month (CO-50: Non-covered service)',
        escalationPath: [
            { step: 'Internal Appeal', deadline: '2024-03-05' },
            { step: 'External Appeal', deadline: '2024-04-01' }
        ],
        auditTrail: [
            { timestamp: '2024-02-25 10:00', action: 'Denial Received by System' },
            { timestamp: '2024-02-25 14:30', action: 'Initial Review by John Carter' }
        ]
    },
    {
        id: 4,
        denialId: 'DNL-0567',
        priority: 'high',
        patient: { name: 'Sarah Johnson', mrn: '12346' },
        serviceDate: '2024-02-21',
        denialDate: '2024-03-03',
        payer: 'Aetna',
        payerContact: {
            phone: '1-800-555-1234',
            email: 'appeals@aetna.com'
        },
        denialReason: 'CO-97: Payment adjusted',
        denialCategory: 'Financial',
        rootCause: 'Payer applied contractual adjustment.',
        amount: 1800,
        daysLeft: 12,
        status: 'Documentation Pending',
        linkedAppealId: 'APL-1003',
        appealManager: 'Maria Garcia',
        appealDocumentation: [
            { label: 'Contractual Agreement', link: '#' },
            { label: 'Adjusted Claim File', link: '#' }
        ],
        payerPolicyReference: 'https://aetna.com/payment-adjustments',
        denialTrends: 'No similar denials this month.',
        escalationPath: [
            { step: 'Internal Appeal', deadline: '2024-03-06' },
            { step: 'External Appeal', deadline: '2024-04-01' }
        ],
        auditTrail: [
            { timestamp: '2024-02-28 10:00', action: 'Denial Received by System' },
            { timestamp: '2024-02-28 14:30', action: 'Initial Review by Maria Garcia' }
        ]
    },
    {
        id: 5,
        denialId: 'DNL-0890',
        priority: 'low',
        patient: { name: 'Sarah Johnson', mrn: '12346' },
        serviceDate: '2024-02-22',
        denialDate: '2024-03-04',
        payer: 'Aetna',
        payerContact: {
            phone: '1-800-555-1234',
            email: 'appeals@aetna.com'
        },
        denialReason: 'CO-18: Duplicate claim',
        denialCategory: 'Administrative',
        rootCause: 'Claim submitted twice due to system error.',
        amount: 950,
        daysLeft: 18,
        status: 'New',
        linkedAppealId: null,
        appealManager: 'Jane Smith',
        appealDocumentation: [
            { label: 'Original Claim File', link: '#' },
            { label: 'Duplicate Claim File', link: '#' }
        ],
        payerPolicyReference: 'https://aetna.com/duplicate-claims',
        denialTrends: 'No similar denials this month.',
        escalationPath: [
            { step: 'Internal Appeal', deadline: '2024-03-15' },
            { step: 'External Appeal', deadline: '2024-04-01' }
        ],
        auditTrail: [
            { timestamp: '2024-03-01 10:00', action: 'Denial Received by System' }
        ]
    },
    {
        id: 6,
        denialId: 'DNL-0345',
        priority: 'high',
        patient: { name: 'Robert Smith', mrn: '12347' },
        serviceDate: '2024-02-23',
        denialDate: '2024-03-04',
        payer: 'Cigna',
        payerContact: {
            phone: '1-800-555-6789',
            email: 'appeals@cigna.com'
        },
        denialReason: 'CO-11: Diagnosis inconsistent',
        denialCategory: 'Clinical',
        rootCause: 'Diagnosis code does not match the procedure.',
        amount: 4200,
        daysLeft: 5,
        status: 'Clinical Review',
        linkedAppealId: 'APL-1004',
        appealManager: 'Dr. Johnson',
        appealDocumentation: [
            { label: 'Medical Records', link: '#' },
            { label: 'Payer Policy Reference', link: '#' }
        ],
        payerPolicyReference: 'https://cigna.com/diagnosis-requirements',
        denialTrends: '1 similar denial this month (CO-11: Diagnosis inconsistent)',
        escalationPath: [
            { step: 'Internal Appeal', deadline: '2024-02-23' },
            { step: 'External Appeal', deadline: '2024-03-20' }
        ],
        auditTrail: [
            { timestamp: '2024-02-20 10:00', action: 'Denial Received by System' },
            { timestamp: '2024-02-20 14:30', action: 'Initial Review by Dr. Johnson' }
        ]
    },
    {
        id: 7,
        denialId: 'DNL-0678',
        priority: 'medium',
        patient: { name: 'Emily Davis', mrn: '12348' },
        serviceDate: '2024-02-24',
        denialDate: '2024-03-04',
        payer: 'Blue Cross',
        payerContact: {
            phone: '1-800-555-9876',
            email: 'appeals@bluecross.com'
        },
        denialReason: 'CO-29: Time limit expired',
        denialCategory: 'Administrative',
        rootCause: 'Claim submitted after the payer\'s filing deadline.',
        amount: 800,
        daysLeft: 20,
        status: 'New',
        linkedAppealId: null,
        appealManager: 'Jane Smith',
        appealDocumentation: [
            { label: 'Claim Submission Proof', link: '#' },
            { label: 'Payer Policy Reference', link: '#' }
        ],
        payerPolicyReference: 'https://bluecross.com/filing-deadlines',
        denialTrends: 'No similar denials this month.',
        escalationPath: [
            { step: 'Internal Appeal', deadline: '2024-03-09' },
            { step: 'External Appeal', deadline: '2024-04-01' }
        ],
        auditTrail: [
            { timestamp: '2024-02-22 10:00', action: 'Denial Received by System' }
        ]
    },
    {
        id: 8,
        denialId: 'DNL-0901',
        priority: 'high',
        patient: { name: 'Emily Davis', mrn: '12348' },
        serviceDate: '2024-02-25',
        denialDate: '2024-03-05',
        payer: 'Blue Cross',
        payerContact: {
            phone: '1-800-555-9876',
            email: 'appeals@bluecross.com'
        },
        denialReason: 'CO-96: Non-covered charges',
        denialCategory: 'Financial',
        rootCause: 'Service not covered under patient\'s plan.',
        amount: 2200,
        daysLeft: 3,
        status: 'Urgent Review',
        linkedAppealId: 'APL-1005',
        appealManager: 'Maria Garcia',
        appealDocumentation: [
            { label: 'Medical Records', link: '#' },
            { label: 'Payer Policy Reference', link: '#' }
        ],
        payerPolicyReference: 'https://bluecross.com/non-covered-charges',
        denialTrends: '2 similar denials this month (CO-96: Non-covered charges)',
        escalationPath: [
            { step: 'Internal Appeal', deadline: '2024-02-26' },
            { step: 'External Appeal', deadline: '2024-03-24' }
        ],
        auditTrail: [
            { timestamp: '2024-02-24 10:00', action: 'Denial Received by System' },
            { timestamp: '2024-02-24 14:30', action: 'Initial Review by Maria Garcia' }
        ]
    },
    {
        id: 9,
        denialId: 'DNL-0123',
        priority: 'medium',
        patient: { name: 'Michael Wilson', mrn: '12349' },
        serviceDate: '2024-02-26',
        denialDate: '2024-03-05',
        payer: 'Humana',
        payerContact: {
            phone: '1-800-555-4321',
            email: 'appeals@humana.com'
        },
        denialReason: 'CO-251: Medical records missing',
        denialCategory: 'Administrative',
        rootCause: 'Required medical records not submitted with the claim.',
        amount: 3200,
        daysLeft: 14,
        status: 'Gathering Records',
        linkedAppealId: 'APL-1006',
        appealManager: 'John Carter',
        appealDocumentation: [
            { label: 'Medical Records', link: '#' },
            { label: 'Payer Policy Reference', link: '#' }
        ],
        payerPolicyReference: 'https://humana.com/medical-records-requirements',
        denialTrends: '1 similar denial this month (CO-251: Medical records missing)',
        escalationPath: [
            { step: 'Internal Appeal', deadline: '2024-02-28' },
            { step: 'External Appeal', deadline: '2024-03-21' }
        ],
        auditTrail: [
            { timestamp: '2024-02-21 10:00', action: 'Denial Received by System' },
            { timestamp: '2024-02-21 14:30', action: 'Initial Review by John Carter' }
        ]
    },
    {
        id: 10,
        denialId: 'DNL-0432',
        priority: 'high',
        patient: { name: 'Michael Wilson', mrn: '12349' },
        serviceDate: '2024-02-28',
        denialDate: '2024-03-06',
        payer: 'Medicare',
        payerContact: {
            phone: '1-800-555-6789',
            email: 'appeals@medicare.com'
        },
        denialReason: 'CO-197: Precertification absent',
        denialCategory: 'Administrative',
        rootCause: 'Precertification not obtained before the service.',
        amount: 2800,
        daysLeft: 8,
        status: 'Pending Provider',
        linkedAppealId: 'APL-1007',
        appealManager: 'Maria Garcia',
        appealDocumentation: [
            { label: 'Precertification Proof', link: '#' },
            { label: 'Payer Policy Reference', link: '#' }
        ],
        payerPolicyReference: 'https://medicare.com/precertification-requirements',
        denialTrends: 'No similar denials this month.',
        escalationPath: [
            { step: 'Internal Appeal', deadline: '2024-03-05' },
            { step: 'External Appeal', deadline: '2024-03-29' }
        ],
        auditTrail: [
            { timestamp: '2024-03-01 10:00', action: 'Denial Received by System' },
            { timestamp: '2024-03-01 14:30', action: 'Initial Review by Maria Garcia' }
        ]
    }
];

export var appealMockData = [
    {
        id: 'APL-1001',
        linkedDenialId: 'DNL-0456',
        status: { main: 'Under Review', sub: 'Awaiting payer response' },
        assignedTo: { name: 'Dr. Smith', role: 'Coder' },
        submittedDate: '2024-02-15',
        expectedResponseDate: '2024-03-15',
        appealDeadline: '2024-03-10',
        daysLeft: 5,
        appealReason: 'CO-22: Missing modifier 25',
        appealType: 'First-Level',
        appealCategory: 'Technical',
        payer: 'UnitedHealthcare',
        payerContact: {
            phone: '1-800-123-4567',
            email: 'appeals@unitedhealthcare.com'
        },
        amountAppealed: 1200,
        potentialRecovery: 1200,
        costOfAppeal: 150,
        daysSinceSubmission: 12,
        notes: 'Attach clinical notes',
        outcome: {
            status: 'Pending',
            recoveredAmount: null,
            recoveryBreakdown: null,
            notes: null
        },
        supportingDocs: ['Appeal Letter', 'Corrected Claim File', 'Medical Record Summary', 'Letter of Medical Necessity'],
        successProbability: 75,
        escalationLevel: 1,
        notes: 'Modifier -25 was missing on CPT 99213. Clinical notes have been prepared and submitted to support the appeal.',
        appealHistory: [
            { date: '2024-02-10', action: 'Appeal created' },
            { date: '2024-02-12', action: 'Clinical notes prepared' },
            { date: '2024-02-15', action: 'Appeal submitted' },
            { date: '2024-02-20', action: 'Clinical notes submitted to payer' }
        ],
        communicationLog: [
            { date: '2024-02-15', type: 'Email', summary: 'Sent appeal letter to payer with corrected claim file.' },
            { date: '2024-02-20', type: 'Email', summary: 'Followed up with payer to confirm receipt of clinical notes.' }
        ],
        nextSteps: 'Follow up with payer on 2024-03-05 to check the status of the appeal.',
        assignedTeam: ['Dr. Smith', 'Jane Doe'],
        appealPriority: 'High',
        appealSource: 'Automated System'
    },
    {
        id: 'APL-1002',
        linkedDenialId: 'DNL-0789',
        status: { main: 'Draft', sub: 'Initial review' },
        assignedTo: { name: 'John Doe', role: 'Billing' },
        submittedDate: '2024-02-25',
        expectedResponseDate: '2024-03-30',
        appealDeadline: '2024-03-25',
        daysLeft: 15,
        appealReason: 'CO-16: Claim lacks information',
        appealType: 'First-Level',
        appealCategory: 'Administrative',
        payer: 'UnitedHealthcare',
        payerContact: {
            phone: '1-800-123-4567',
            email: 'appeals@unitedhealthcare.com'
        },
        amountAppealed: 2500,
        potentialRecovery: 2500,
        costOfAppeal: 200,
        daysSinceSubmission: 5,
        notes: 'Add prior auth proof',
        outcome: {
            status: 'Pending',
            recoveredAmount: null,
            recoveryBreakdown: null,
            notes: null
        },
        supportingDocs: ['Template', 'Corrected Claim File', 'Patient Demographics'],
        successProbability: 65,
        escalationLevel: 1,
        notes: 'Patient demographic information was missing. Updated claim file has been prepared and is ready for submission.',
        appealHistory: [
            { date: '2024-02-20', action: 'Appeal created' },
            { date: '2024-02-22', action: 'Patient demographics prepared' },
            { date: '2024-02-25', action: 'Appeal drafted' }
        ],
        communicationLog: [
            { date: '2024-02-25', type: 'Email', summary: 'Sent draft appeal to internal team for review.' }
        ],
        nextSteps: 'Submit appeal by 2024-03-25 after attaching prior authorization proof.',
        assignedTeam: ['John Doe', 'Maria Garcia'],
        appealPriority: 'Medium',
        appealSource: 'Manual Submission'
    },
    {
        id: 'APL-1003',
        linkedDenialId: 'DNL-0567',
        status: { main: 'Under Review', sub: 'Documentation review' },
        assignedTo: { name: 'Sarah Chen', role: 'Clinical' },
        submittedDate: '2024-02-20',
        expectedResponseDate: '2024-03-20',
        appealDeadline: '2024-03-15',
        daysLeft: 8,
        appealReason: 'CO-97: Payment adjusted',
        appealType: 'First-Level',
        appealCategory: 'Financial',
        payer: 'Aetna',
        payerContact: {
            phone: '1-800-555-1234',
            email: 'appeals@aetna.com'
        },
        amountAppealed: 1800,
        potentialRecovery: 1800,
        costOfAppeal: 100,
        daysSinceSubmission: 10,
        notes: 'Review clinical documentation',
        outcome: {
            status: 'Pending',
            recoveredAmount: null,
            recoveryBreakdown: null,
            notes: null
        },
        supportingDocs: ['Medical Records', 'Appeal Letter', 'Contractual Agreement'],
        successProbability: 82,
        escalationLevel: 1,
        notes: 'Payer applied contractual adjustment. Contractual agreement has been submitted for review to dispute the adjustment.',
        appealHistory: [
            { date: '2024-02-15', action: 'Appeal created' },
            { date: '2024-02-18', action: 'Clinical documentation prepared' },
            { date: '2024-02-20', action: 'Appeal submitted' },
            { date: '2024-02-22', action: 'Contractual agreement submitted to payer' }
        ],
        communicationLog: [
            { date: '2024-02-20', type: 'Email', summary: 'Sent appeal letter to payer with medical records.' },
            { date: '2024-02-21', type: 'Phone', summary: 'Spoke with payer representative to confirm receipt of contractual agreement.' }
        ],
        nextSteps: 'Follow up with payer on 2024-03-10 to check the status of the documentation review.',
        assignedTeam: ['Sarah Chen', 'Dr. Johnson'],
        appealPriority: 'High',
        appealSource: 'Automated System'
    },
    {
        id: 'APL-1004',
        linkedDenialId: 'DNL-0345',
        status: { main: 'Won', sub: 'Partial approval' },
        assignedTo: { name: 'Dr. Johnson', role: 'Clinical' },
        submittedDate: '2024-02-10',
        expectedResponseDate: '2024-03-10',
        appealDeadline: '2024-03-05',
        daysLeft: 0,
        appealReason: 'CO-11: Diagnosis inconsistent',
        appealType: 'First-Level',
        appealCategory: 'Clinical',
        payer: 'Cigna',
        payerContact: {
            phone: '1-800-555-6789',
            email: 'appeals@cigna.com'
        },
        amountAppealed: 4200,
        potentialRecovery: 3500,
        costOfAppeal: 300,
        daysSinceSubmission: 20,
        notes: 'Process recovery',
        outcome: {
            status: 'Won',
            recoveredAmount: 3500,
            recoveryBreakdown: {
                allowedAmount: 3500,
                contractualAdjustment: 700
            },
            notes: 'Diagnosis code was inconsistent with the procedure. Appeal was partially approved after submitting clinical notes.'
        },
        supportingDocs: ['Appeal Letter', 'Clinical Notes', 'Approval Notice'],
        successProbability: 100,
        escalationLevel: 1,
        notes: 'Diagnosis code was inconsistent with the procedure. Appeal was partially approved after submitting clinical notes.',
        appealHistory: [
            { date: '2024-02-05', action: 'Appeal created' },
            { date: '2024-02-07', action: 'Clinical notes prepared' },
            { date: '2024-02-10', action: 'Appeal submitted' },
            { date: '2024-02-15', action: 'Clinical notes submitted to payer' },
            { date: '2024-03-05', action: 'Appeal partially approved' }
        ],
        communicationLog: [
            { date: '2024-02-10', type: 'Email', summary: 'Sent appeal letter to payer with clinical notes.' },
            { date: '2024-02-15', type: 'Email', summary: 'Followed up with payer to confirm receipt of clinical notes.' },
            { date: '2024-03-05', type: 'Email', summary: 'Received partial approval notice from payer.' }
        ],
        nextSteps: 'Process recovery payment for the approved amount of $3500.',
        assignedTeam: ['Dr. Johnson', 'Maria Garcia'],
        appealPriority: 'High',
        appealSource: 'Manual Submission'
    },
    {
        id: 'APL-1005',
        linkedDenialId: 'DNL-0901',
        status: { main: 'Under Review', sub: 'Escalated to supervisor' },
        assignedTo: { name: 'Maria Garcia', role: 'Appeals' },
        submittedDate: '2024-02-18',
        expectedResponseDate: '2024-03-18',
        appealDeadline: '2024-03-15',
        daysLeft: 6,
        appealReason: 'CO-96: Non-covered charges',
        appealType: 'Second-Level',
        appealCategory: 'Financial',
        payer: 'Blue Cross',
        payerContact: {
            phone: '1-800-555-9876',
            email: 'appeals@bluecross.com'
        },
        amountAppealed: 2200,
        potentialRecovery: 2200,
        costOfAppeal: 250,
        daysSinceSubmission: 15,
        notes: 'Follow up with payer',
        outcome: {
            status: 'Pending',
            recoveredAmount: null,
            recoveryBreakdown: null,
            notes: null
        },
        supportingDocs: ['Appeal Letter', 'Policy Documentation', 'Medical Records'],
        successProbability: 70,
        escalationLevel: 2,
        notes: 'Service was deemed non-covered. Policy documentation has been submitted to dispute the denial.',
        appealHistory: [
            { date: '2024-02-15', action: 'Appeal created' },
            { date: '2024-02-16', action: 'Policy documentation prepared' },
            { date: '2024-02-18', action: 'Appeal submitted' },
            { date: '2024-02-20', action: 'Policy documentation submitted to payer' }
        ],
        communicationLog: [
            { date: '2024-02-18', type: 'Email', summary: 'Sent appeal letter to payer with policy documentation.' },
            { date: '2024-02-20', type: 'Phone', summary: 'Spoke with payer representative to confirm receipt of policy documentation.' }
        ],
        nextSteps: 'Follow up with payer on 2024-03-12 to check the status of the escalated appeal.',
        assignedTeam: ['Maria Garcia', 'John Doe'],
        appealPriority: 'High',
        appealSource: 'Automated System'
    },
    {
        id: 'APL-1006',
        linkedDenialId: 'DNL-0123',
        status: { main: 'Lost', sub: 'Appeal denied' },
        assignedTo: { name: 'Tom Wilson', role: 'Appeals' },
        submittedDate: '2024-02-05',
        expectedResponseDate: '2024-03-05',
        appealDeadline: '2024-03-01',
        daysLeft: 0,
        appealReason: 'CO-251: Medical records missing',
        appealType: 'Second-Level',
        appealCategory: 'Administrative',
        payer: 'Humana',
        payerContact: {
            phone: '1-800-555-4321',
            email: 'appeals@humana.com'
        },
        amountAppealed: 3200,
        potentialRecovery: 0,
        costOfAppeal: 200,
        daysSinceSubmission: 25,
        notes: 'Prepare second level appeal',
        outcome: {
            status: 'Lost',
            recoveredAmount: 0,
            recoveryBreakdown: null,
            notes: 'Required medical records were not submitted in time, resulting in denial.'
        },
        supportingDocs: ['Appeal Letter', 'Denial Notice', 'Medical Records'],
        successProbability: 35,
        escalationLevel: 2,
        notes: 'Required medical records were not submitted in time, resulting in denial. Preparing for second-level appeal with updated documentation.',
        appealHistory: [
            { date: '2024-02-01', action: 'Appeal created' },
            { date: '2024-02-03', action: 'Medical records prepared' },
            { date: '2024-02-05', action: 'Appeal submitted' },
            { date: '2024-02-10', action: 'Medical records submitted to payer' },
            { date: '2024-03-01', action: 'Appeal denied' }
        ],
        communicationLog: [
            { date: '2024-02-05', type: 'Email', summary: 'Sent appeal letter to payer with initial documentation.' },
            { date: '2024-02-10', type: 'Email', summary: 'Sent updated medical records to payer.' },
            { date: '2024-03-01', type: 'Email', summary: 'Received denial notice from payer due to late submission of medical records.' }
        ],
        nextSteps: 'Prepare second-level appeal with updated medical records and submit by 2024-03-15.',
        assignedTeam: ['Tom Wilson', 'Dr. Johnson'],
        appealPriority: 'Medium',
        appealSource: 'Manual Submission'
    },
    {
        id: 'APL-1007',
        linkedDenialId: 'DNL-0432',
        status: { main: 'Under Review', sub: 'Clinical review' },
        assignedTo: { name: 'Dr. Brown', role: 'Clinical' },
        submittedDate: '2024-02-22',
        expectedResponseDate: '2024-03-22',
        appealDeadline: '2024-03-17',
        daysLeft: 10,
        appealReason: 'CO-197: Precertification absent',
        appealType: 'First-Level',
        appealCategory: 'Administrative',
        payer: 'Medicare',
        payerContact: {
            phone: '1-800-555-6789',
            email: 'appeals@medicare.com'
        },
        amountAppealed: 2800,
        potentialRecovery: 2800,
        costOfAppeal: 180,
        daysSinceSubmission: 8,
        notes: 'Submit additional documentation',
        outcome: {
            status: 'Pending',
            recoveredAmount: null,
            recoveryBreakdown: null,
            notes: null
        },
        supportingDocs: ['Appeal Letter', 'Prior Auth Documentation', 'Payer Policy Reference'],
        successProbability: 60,
        escalationLevel: 1,
        notes: 'Precertification was not obtained. Additional documentation, including prior authorization proof, has been submitted to support the appeal.',
        appealHistory: [
            { date: '2024-02-18', action: 'Appeal created' },
            { date: '2024-02-20', action: 'Prior auth documentation prepared' },
            { date: '2024-02-22', action: 'Appeal submitted' },
            { date: '2024-02-24', action: 'Prior auth documentation submitted to payer' }
        ],
        communicationLog: [
            { date: '2024-02-22', type: 'Email', summary: 'Sent appeal letter to payer with prior authorization documentation.' },
            { date: '2024-02-24', type: 'Phone', summary: 'Spoke with payer representative to confirm receipt of prior authorization documentation.' }
        ],
        nextSteps: 'Follow up with payer on 2024-03-15 to check the status of the clinical review.',
        assignedTeam: ['Dr. Brown', 'Maria Garcia'],
        appealPriority: 'High',
        appealSource: 'Automated System'
    }
];

export var medicalRecordSummary = `
MEDICAL RECORD SUMMARY Patient: John Doe MRN: 12345 DOB: 06/15/1975 Insurance: UnitedHealthcare Policy #: UHC456789012
VISIT DATE: February 15, 2024 PROVIDER: Dr. James Wilson LOCATION: Emerge Medical Center - Orthopedics Department
CHIEF COMPLAINT Patient presents with persistent left knee pain and limited mobility for the past 4 months.
HISTORY OF PRESENT ILLNESS 48-year-old male with progressively worsening left knee pain. Symptoms have been persistent for approximately 4 months without a clear inciting event. Patient reports:
    • Pain scale: 8/10
    • Difficulty with weight-bearing activities
    • Pain exacerbated by prolonged walking or stair climbing
    • Swelling and stiffness, especially in the morning
    • No significant relief with NSAIDs or physical therapy
    • Prior corticosteroid injection provided only temporary relief
PAST MEDICAL HISTORY
    1 Hypertension - managed with medication
    2 Hyperlipidemia
    3 Osteoarthritis
MEDICATIONS
    1 Amlodipine 5mg daily
    2 Atorvastatin 20mg daily
    3 Ibuprofen 800mg as needed
ALLERGIES No known drug allergies (NKDA)
PHYSICAL EXAMINATION Vital Signs:
    • BP: 132/80
    • HR: 74
    • RR: 16
    • Temp: 98.4°F
    • O2 Sat: 98% RA
Musculoskeletal Examination: Left Knee:
    • Moderate joint effusion
    • Pain with active and passive range of motion
    • Positive McMurray test
    • Positive patellar grind test
    • No ligamentous instability
DIAGNOSTIC STUDIES MRI Left Knee (02/13/2024):
    • Medial meniscus tear (complex)
    • Moderate tricompartmental osteoarthritis
    • No significant ligamentous injury
ASSESSMENT
    1 Left knee medial meniscus tear
    2 Left knee osteoarthritis
PLAN
    1 Recommend arthroscopic knee surgery for meniscus repair and debridement
    2 Discussed surgical risks, benefits, and alternatives
    3 Patient agrees to proceed with surgery
    4 Pre-operative clearance required from PCP
    5 Surgery scheduled within next 2 weeks
    6 Prescribed:
        ◦ Tramadol 50mg q6h prn pain
        ◦ Continue current medications
FOLLOW-UP Schedule pre-operative evaluation in 1 week
Time Spent: 30 minutes
50% time spent in counseling regarding surgical options and post-operative expectations
Electronically signed by: James Wilson, MD Board Certified Orthopedic Surgeon License #: 12345 NPI: 9876543210 Date: February 15, 2024 14:30
`;

export var correctedClaimFile = `
CORRECTED CLAIM FILE
Patient Information: Patient Name: John Doe Date of Birth: 06/15/1975 MRN: 12345 Insurance Provider: UnitedHealthcare Policy Number: UHC456789012
Provider Information: Provider Name: Dr. James Wilson, MD NPI: 9876543210 Facility Name: Emerge Medical Center - Orthopedics Department Provider Contact: (XXX) XXX-XXXX
Claim Information: Original Claim Number: DNL-0456 Date of Service: February 15, 2024 Procedure Performed: Arthroscopic knee surgery - meniscus repair and debridement CPT Code(s): 29881, 29877, 99213-25 ICD-10 Code(s): M23.21 (Medial Meniscus Tear, Left Knee), M17.12 (Unilateral Primary Osteoarthritis, Left Knee)
Correction Details:
    • Original Submission Error: Missing modifier -25 on CPT code 99213.
    • Correction: Modifier -25 has been appended to CPT 99213 to indicate a significant, separately identifiable evaluation and management (E/M) service provided on the same day as the procedure.
    • Supporting Documentation: Attached are the medical records, physician notes, MRI results, and prior authorization confirmation to substantiate medical necessity and coding accuracy.
Supporting Attachments:
    • Corrected CMS-1500 Claim Form (with appropriate modifiers)
    • Operative Report
    • Preoperative & Postoperative Notes
    • Medical Necessity Letter from Dr. James Wilson
    • Prior Authorization Confirmation (if applicable)
    • Explanation of Benefits (EOB) from Initial Denial
Request for Reconsideration: We respectfully request that UnitedHealthcare review this corrected claim and process it accordingly. The necessary modifications have been made to ensure compliance with billing guidelines. If further clarification or additional documentation is needed, please contact us at the information below.
Sincerely, Maria Garcia Medical Billing Specialist Emerge Medical Center maria.garcia@emergemedicalcenter.org
`;

export var letterOfMedicalNecessity = `
LETTER OF MEDICAL NECESSITY
Date: February 15, 2024 To: UnitedHealthcare From: Dr. James Wilson, MD Patient Name: John Doe MRN: 12345 DOB: 06/15/1975
To Whom It May Concern,
I am writing on behalf of my patient, John Doe, to request approval for arthroscopic knee surgery to repair a medial meniscus tear and perform debridement. Mr. Doe has been under my care for persistent left knee pain and limited mobility for the past four months. His symptoms have progressively worsened despite conservative treatment measures, including NSAIDs, physical therapy, and a prior corticosteroid injection, which provided only temporary relief.
Recent MRI imaging dated February 13, 2024, confirmed a complex medial meniscus tear along with moderate tricompartmental osteoarthritis. Physical examination findings, including moderate joint effusion, pain with active and passive range of motion, and positive McMurray and patellar grind tests, further support this diagnosis.
Given the failure of conservative management and the presence of significant structural damage, arthroscopic knee surgery is the most appropriate course of action to restore function, reduce pain, and improve the patient’s quality of life. This procedure is medically necessary to prevent further deterioration and to facilitate an optimal recovery.
I respectfully request that UnitedHealthcare authorize this procedure so that Mr. Doe can proceed with the necessary surgical intervention. Please do not hesitate to contact my office should you require additional documentation or have any questions.
Sincerely, James Wilson, MD Board Certified Orthopedic Surgeon License #: 12345 NPI: 9876543210 Contact: Emerge Medical Center - Orthopedics Department Phone: (XXX) XXX-XXXX Email: drwilson@emergeortho.com

`