import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Photo Gallery Types
  type PhotoMetadata = {
    id : Text;
    title : Text;
    description : Text;
    uploadDate : Int;
    blob : Storage.ExternalBlob;
  };

  module PhotoMetadata {
    public func compare(p1 : PhotoMetadata, p2 : PhotoMetadata) : Order.Order {
      Text.compare(p1.title, p2.title);
    };
  };

  let photos = Map.empty<Text, PhotoMetadata>();

  // Admin-only: Add Photo
  public shared ({ caller }) func addPhoto(id : Text, title : Text, description : Text, blobRef : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add photos");
    };

    let photo : PhotoMetadata = {
      id;
      title;
      description;
      uploadDate = Time.now();
      blob = blobRef;
    };

    photos.add(id, photo);
  };

  // Public: Get Single Photo
  public query ({ caller }) func getPhoto(id : Text) : async ?PhotoMetadata {
    photos.get(id);
  };

  // Public: Get All Photos
  public query ({ caller }) func getAllPhotos() : async [PhotoMetadata] {
    photos.values().toArray().sort();
  };

  // Admin-only: Update Photo
  public shared ({ caller }) func updatePhoto(id : Text, newTitle : Text, newDescription : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update photos");
    };

    switch (photos.get(id)) {
      case (null) {
        Runtime.trap("Photo not found");
      };
      case (?existingPhoto) {
        let updatedPhoto : PhotoMetadata = {
          id = existingPhoto.id;
          title = newTitle;
          description = newDescription;
          uploadDate = existingPhoto.uploadDate;
          blob = existingPhoto.blob;
        };
        photos.add(id, updatedPhoto);
      };
    };
  };

  // Admin-only: Delete Photo
  public shared ({ caller }) func deletePhoto(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete photos");
    };

    if (not photos.containsKey(id)) {
      Runtime.trap("Photo not found");
    };

    photos.remove(id);
  };
};
