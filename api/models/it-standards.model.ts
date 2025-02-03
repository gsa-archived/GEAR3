import { AppBundle } from "./it-standards-app-bundle.model";

export class ITStandards {
  public ID: number = null;
  public Name: string = null;
  public Description: string = null;
  public ApprovalExpirationDate: Date = null;
  public Vendor_Standard_Organization: string = null;
  public Available_through_Myview: string = null;
  public Gold_Image: string = null;
  public attestation_required: number = null;
  public fedramp: string = null;
  public open_source: string = null;
  public RITM: string = null;
  public Gold_Image_Comment: string = null;
  public attestation_link: string = null;
  public Comments: string = null;
  public old_Id: string = null;
  public POCorg: string = null;
  public ReferenceDocuments: string = null;
  public Manufacturer: string = null;
  public SoftwareProduct: string = null;
  public SoftwareVersion: string = null;
  public SoftwareRelease: string = null;
  public ManufacturerName: string = null;
  public SoftwareProductName: string = null;
  public SoftwareVersionName: string = null;
  public SoftwareReleaseName: string = null;
  public Status: string = null;
  public Deploymenttype: string = null;
  public StandardType: string = null;
  public POC: string = null;
  public Category: string = null;
  public OldName: string = null;
  public EndOfLifeDate: Date = null;
  public ApprovedVersions: string = null;
  public OperatingSystems: number[] = null;
  public ApBundleIds: AppBundle[] = null;
}
